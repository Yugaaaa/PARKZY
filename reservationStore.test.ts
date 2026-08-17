import { describe, expect, it } from 'vitest';
import { createReservationInputSchema } from './reservationStore';

const baseInput = {
  userId: 'demo-user',
  userName: 'Demo User',
  spaceId: 'sp-01',
  spaceLabel: 'TH-01',
  zoneId: 'zone-townhall',
  zoneName: 'Town Hall North',
  vehicleType: 'hatchback' as const,
  vehiclePlate: 'TN 38 C 1234',
  hourlyRate: 30,
  arrivalWindow: '30m' as const,
  needsAccessibilityPermit: false,
  permitStatus: 'none' as const,
};

describe('reservation input contract', () => {
  it('accepts an ordinary arrival-window request without a permit', () => {
    expect(createReservationInputSchema.parse(baseInput)).toMatchObject({
      arrivalWindow: '30m',
      needsAccessibilityPermit: false,
    });
  });

  it('accepts a verified accessibility request at the transport boundary', () => {
    const result = createReservationInputSchema.parse({
      ...baseInput,
      needsAccessibilityPermit: true,
      permitStatus: 'verified',
    });
    expect(result.permitStatus).toBe('verified');
  });

  it('rejects unsupported arrival windows before database access', () => {
    expect(() => createReservationInputSchema.parse({ ...baseInput, arrivalWindow: '90m' })).toThrow();
  });

  it('rejects malformed reservation identifiers before database access', () => {
    expect(() => createReservationInputSchema.parse({ ...baseInput, spaceId: '' })).toThrow();
  });
});
