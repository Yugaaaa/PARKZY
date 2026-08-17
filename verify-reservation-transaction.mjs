import mysql from 'mysql2/promise';
import { randomUUID } from 'node:crypto';

const db = await mysql.createConnection({ uri: process.env.DATABASE_URL, timezone: 'Z' });
const id = randomUUID();
try {
  await db.query('START TRANSACTION');
  await db.execute(`
    INSERT INTO curb_reservations
      (id, user_id, user_name, space_id, space_label, zone_id, zone_name, vehicle_type, vehicle_plate, hourly_rate, arrival_window, needs_accessibility_permit, permit_status, status, held_until, created_at)
    VALUES (?, 'rollback-check', 'Rollback Check', 'space-rollback-check', 'ROLLBACK-01', 'zone-check', 'Rollback Check Zone', 'hatchback', 'ROLLBACK', 30, '30m', FALSE, 'none', 'held', DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 10 MINUTE), UTC_TIMESTAMP(3))
  `, [id]);
  const [rows] = await db.query('SELECT id, arrival_window, needs_accessibility_permit, permit_status FROM curb_reservations WHERE id = ?', [id]);
  if (!Array.isArray(rows) || rows.length !== 1) throw new Error('Reservation row could not be read back inside the transaction.');
  await db.query('ROLLBACK');
  const [afterRollback] = await db.query('SELECT id FROM curb_reservations WHERE id = ?', [id]);
  console.log(JSON.stringify({ insertedAndRead: true, rollbackSucceeded: Array.isArray(afterRollback) && afterRollback.length === 0, id, row: rows[0] }));
} finally {
  db.destroy();
}
