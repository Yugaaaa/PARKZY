export type ArrivalWindow = 'now' | '15m' | '30m' | '60m';
export type PermitStatus = 'none' | 'pending' | 'verified' | 'rejected';

export type ReservationReceipt = {
  receiptId: string;
  reservationId: string;
  bay: { id: string; label: string; zoneId: string; zoneName: string };
  arrivalWindow: ArrivalWindow;
  arrivalLabel: string;
  permitRequest: boolean;
  permitStatus: PermitStatus;
  permitMessage: string;
  vehicle: { type: 'two_wheeler' | 'hatchback' | 'ev'; plate: string };
  rate: number;
  holdMinutes: number;
  holdSeconds?: number;
  holdExpiresAt: string;
  status: 'held';
  createdAt: string;
};

export async function persistReservation(input: {
  email: string;
  userId: string;
  userName: string;
  spaceId: string;
  spaceLabel: string;
  zoneId: string;
  zoneName: string;
  vehicleType: 'two_wheeler' | 'hatchback' | 'ev';
  vehiclePlate: string;
  hourlyRate: number;
  arrivalWindow: ArrivalWindow;
  needsAccessibilityPermit: boolean;
  permitStatus: PermitStatus;
}): Promise<ReservationReceipt> {
  const sessionResponse = await fetch('/api/session/demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ email: input.email }),
  });
  if (!sessionResponse.ok) throw new Error('Demo identity could not be verified.');

  const response = await fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(input),
  });
  const payload = (await response.json().catch(() => null)) as { receipt?: ReservationReceipt; message?: string } | null;
  if (!response.ok || !payload?.receipt) {
    throw new Error(payload?.message || 'Reservation could not be saved.');
  }
  return payload.receipt;
}
