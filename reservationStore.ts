import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { generateInitialSpaces } from '../client/src/data/seedData';

const arrivalWindowSchema = z.enum(['now', '15m', '30m', '60m']);
const permitStatusSchema = z.enum(['none', 'pending', 'verified', 'rejected']);

export const createReservationInputSchema = z.object({
  userId: z.string().min(1).max(128),
  userName: z.string().min(1).max(160),
  spaceId: z.string().min(1).max(128),
  spaceLabel: z.string().min(1).max(64),
  zoneId: z.string().min(1).max(128),
  zoneName: z.string().min(1).max(160),
  vehicleType: z.enum(['two_wheeler', 'hatchback', 'ev']),
  vehiclePlate: z.string().min(1).max(32),
  hourlyRate: z.number().nonnegative().max(100000),
  arrivalWindow: arrivalWindowSchema,
  needsAccessibilityPermit: z.boolean(),
  permitStatus: permitStatusSchema,
});

export type CreateReservationInput = z.infer<typeof createReservationInputSchema>;

export type ReservationReceipt = {
  receiptId: string;
  reservationId: string;
  bay: { id: string; label: string; zoneId: string; zoneName: string };
  arrivalWindow: CreateReservationInput['arrivalWindow'];
  arrivalLabel: string;
  permitRequest: boolean;
  permitStatus: CreateReservationInput['permitStatus'];
  permitMessage: string;
  vehicle: { type: CreateReservationInput['vehicleType']; plate: string };
  rate: number;
  holdMinutes: number;
  holdExpiresAt: string;
  status: 'held';
  createdAt: string;
};

type ReservationRow = RowDataPacket & {
  id: string;
  spaceId: string;
  spaceLabel: string;
  zoneId: string;
  zoneName: string;
  arrivalWindow: CreateReservationInput['arrivalWindow'];
  needsAccessibilityPermit: number;
  permitStatus: CreateReservationInput['permitStatus'];
  vehicleType: CreateReservationInput['vehicleType'];
  vehiclePlate: string;
  hourlyRate: number;
  heldUntil: Date;
  createdAt: Date;
};

let pool: Pool | null = null;

function getPool() {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  pool = mysql.createPool({ uri: url, connectionLimit: 5, timezone: 'Z' });
  return pool;
}

export async function ensureReservationSchema() {
  const db = getPool();
  if (!db) return false;
  await db.query(`
    CREATE TABLE IF NOT EXISTS curb_reservations (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(128) NOT NULL,
      user_name VARCHAR(160) NOT NULL,
      space_id VARCHAR(128) NOT NULL,
      space_label VARCHAR(64) NOT NULL,
      zone_id VARCHAR(128) NOT NULL,
      zone_name VARCHAR(160) NOT NULL,
      vehicle_type ENUM('two_wheeler','hatchback','ev') NOT NULL,
      vehicle_plate VARCHAR(32) NOT NULL,
      hourly_rate DECIMAL(10,2) NOT NULL,
      arrival_window ENUM('now','15m','30m','60m') NOT NULL,
      needs_accessibility_permit BOOLEAN NOT NULL DEFAULT FALSE,
      permit_status ENUM('none','pending','verified','rejected') NOT NULL DEFAULT 'none',
      status ENUM('held','confirmed','checked_in','completed','cancelled','expired','conflict') NOT NULL DEFAULT 'held',
      held_until DATETIME(3) NOT NULL,
      created_at DATETIME(3) NOT NULL,
      INDEX idx_curb_res_space_status (space_id, status, held_until),
      INDEX idx_curb_res_user_created (user_id, created_at)
    )
  `);
  return true;
}

const arrivalLabels: Record<CreateReservationInput['arrivalWindow'], string> = {
  now: 'Arriving now',
  '15m': 'Within 15 minutes',
  '30m': 'Within 30 minutes',
  '60m': 'Within 60 minutes',
};

function makeReceipt(input: CreateReservationInput, reservationId: string, createdAt: Date, heldUntil: Date): ReservationReceipt {
  const permitMessage = input.needsAccessibilityPermit
    ? input.permitStatus === 'verified'
      ? 'Verified permit request attached to this hold.'
      : 'Permit verification required before an accessible bay can be confirmed.'
    : 'No accessibility permit requested.';

  return {
    receiptId: `CS-${reservationId.slice(0, 8).toUpperCase()}`,
    reservationId,
    bay: { id: input.spaceId, label: input.spaceLabel, zoneId: input.zoneId, zoneName: input.zoneName },
    arrivalWindow: input.arrivalWindow,
    arrivalLabel: arrivalLabels[input.arrivalWindow],
    permitRequest: input.needsAccessibilityPermit,
    permitStatus: input.permitStatus,
    permitMessage,
    vehicle: { type: input.vehicleType, plate: input.vehiclePlate },
    rate: input.hourlyRate,
    holdMinutes: 0.25,
    holdExpiresAt: heldUntil.toISOString(),
    status: 'held',
    createdAt: createdAt.toISOString(),
  };
}

export async function createReservation(input: CreateReservationInput) {
  const parsed = createReservationInputSchema.parse(input);
  const authoritativeSpace = generateInitialSpaces().find((space) => space.id === parsed.spaceId);
  if (!authoritativeSpace) {
    const error = new Error('The selected parking bay is not recognized.');
    Object.assign(error, { code: 'SPACE_NOT_FOUND', status: 404 });
    throw error;
  }
  if (authoritativeSpace.status !== 'available') {
    const error = new Error('The selected parking bay is not currently available.');
    Object.assign(error, { code: 'SPACE_UNAVAILABLE', status: 409 });
    throw error;
  }
  if (authoritativeSpace.zoneId !== parsed.zoneId || authoritativeSpace.label !== parsed.spaceLabel) {
    const error = new Error('The selected bay details no longer match the map.');
    Object.assign(error, { code: 'SPACE_DETAILS_STALE', status: 409 });
    throw error;
  }
  if (parsed.needsAccessibilityPermit && authoritativeSpace.kind !== 'accessible') {
    const error = new Error('Accessibility permits can only be attached to accessible bays.');
    Object.assign(error, { code: 'SPACE_NOT_ACCESSIBLE', status: 422 });
    throw error;
  }
  if (parsed.needsAccessibilityPermit && parsed.permitStatus !== 'verified') {
    const error = new Error('A verified accessibility permit is required for this request.');
    Object.assign(error, { code: 'PERMIT_NOT_VERIFIED', status: 422 });
    throw error;
  }

  const db = getPool();
  if (!db) {
    const error = new Error('Reservation database is not configured.');
    Object.assign(error, { code: 'DATABASE_UNAVAILABLE', status: 503 });
    throw error;
  }

  const connection: PoolConnection = await db.getConnection();
  const now = new Date();
  const heldUntil = new Date(now.getTime() + 15 * 1000);
  const reservationId = randomUUID();

  try {
    await connection.beginTransaction();
    const [rows] = await connection.query<ReservationRow[]>(
      `SELECT id FROM curb_reservations
       WHERE space_id = ? AND status IN ('held','confirmed','checked_in') AND held_until > UTC_TIMESTAMP(3)
       FOR UPDATE`,
      [parsed.spaceId]
    );
    if (rows.length > 0) {
      const error = new Error('This parking bay is already held or reserved.');
      Object.assign(error, { code: 'SPACE_CONFLICT', status: 409 });
      throw error;
    }

    await connection.execute<ResultSetHeader>(
      `INSERT INTO curb_reservations
        (id, user_id, user_name, space_id, space_label, zone_id, zone_name, vehicle_type, vehicle_plate, hourly_rate, arrival_window, needs_accessibility_permit, permit_status, status, held_until, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'held', ?, ?)`,
      [reservationId, parsed.userId, parsed.userName, parsed.spaceId, parsed.spaceLabel, parsed.zoneId, parsed.zoneName, parsed.vehicleType, parsed.vehiclePlate, parsed.hourlyRate, parsed.arrivalWindow, parsed.needsAccessibilityPermit, parsed.permitStatus, heldUntil, now]
    );
    await connection.commit();
    return makeReceipt(parsed, reservationId, now, heldUntil);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getUserReservations(userId?: string) {
  const db = getPool();
  if (!db) return [];
  const [rows] = await db.query<ReservationRow[]>(
    `SELECT id, user_id AS userId, user_name AS userName, space_id AS spaceId, space_label AS spaceLabel, zone_id AS zoneId, zone_name AS zoneName,
      arrival_window AS arrivalWindow, needs_accessibility_permit AS needsAccessibilityPermit,
      permit_status AS permitStatus, vehicle_type AS vehicleType, vehicle_plate AS vehiclePlate,
      hourly_rate AS hourlyRate, held_until AS heldUntil, created_at AS createdAt
     FROM curb_reservations ${userId ? 'WHERE user_id = ?' : ''} ORDER BY created_at DESC LIMIT 100`,
    userId ? [userId] : []
  );
  return rows.map((row) => makeReceipt({
    userId: row.userId || userId || 'operator-view',
    userName: row.userName || '',
    spaceId: row.spaceId,
    spaceLabel: row.spaceLabel,
    zoneId: row.zoneId,
    zoneName: row.zoneName,
    vehicleType: row.vehicleType,
    vehiclePlate: row.vehiclePlate,
    hourlyRate: Number(row.hourlyRate),
    arrivalWindow: row.arrivalWindow,
    needsAccessibilityPermit: Boolean(row.needsAccessibilityPermit),
    permitStatus: row.permitStatus,
  }, row.id, new Date(row.createdAt), new Date(row.heldUntil)));
}
