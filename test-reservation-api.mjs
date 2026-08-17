const baseUrl = process.argv[2] || 'http://127.0.0.1:3103';
const cookieHeader = (response) => response.headers.get('set-cookie')?.split(';')[0] || '';

const sessionResponse = await fetch(`${baseUrl}/api/session/demo`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'citizen@curbsense.city' }),
});
if (!sessionResponse.ok) throw new Error(`Demo session failed: ${sessionResponse.status}`);
const cookie = cookieHeader(sessionResponse);

const createResponse = await fetch(`${baseUrl}/api/reservations`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Cookie: cookie },
  body: JSON.stringify({
    userId: 'client-supplied-value-is-ignored',
    userName: 'Client supplied value is ignored',
    spaceId: 'sp-th-02',
    spaceLabel: 'TH-02',
    zoneId: 'zone-townhall',
    zoneName: 'Town Hall North',
    vehicleType: 'hatchback',
    vehiclePlate: 'TN 38 C 1234',
    hourlyRate: 30,
    arrivalWindow: '30m',
    needsAccessibilityPermit: true,
    permitStatus: 'none',
  }),
});
const created = await createResponse.json();
if (!createResponse.ok || !created.receipt?.reservationId) throw new Error(`Reservation create failed: ${createResponse.status} ${JSON.stringify(created)}`);

const listResponse = await fetch(`${baseUrl}/api/reservations`, { headers: { Cookie: cookie } });
const list = await listResponse.json();
if (!listResponse.ok || !list.reservations.some((reservation) => reservation.reservationId === created.receipt.reservationId)) {
  throw new Error(`Reservation readback failed: ${listResponse.status} ${JSON.stringify(list)}`);
}

const cancelResponse = await fetch(`${baseUrl}/api/reservations/${created.receipt.reservationId}`, { method: 'DELETE', headers: { Cookie: cookie } });
if (!cancelResponse.ok) throw new Error(`Reservation cleanup failed: ${cancelResponse.status} ${await cancelResponse.text()}`);

console.log(JSON.stringify({
  persisted: true,
  receiptId: created.receipt.receiptId,
  bay: created.receipt.bay.label,
  arrival: created.receipt.arrivalLabel,
  permitRequest: created.receipt.permitRequest,
  permitStatusDerivedByServer: created.receipt.permitStatus,
  readBack: true,
  cancelledForCleanup: true,
}, null, 2));
