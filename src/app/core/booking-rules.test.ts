import { describe, expect, it } from 'vitest';
import { BREAKFAST_PER_GUEST_NIGHT, bookingTotal, isoDate } from './booking-rules.ts';

describe('bookingTotal', () => {
  const stay = { pricePerNight: 100 };

  it('charges the nightly price per night', () => {
    expect(bookingTotal(stay, { nights: 3, guests: 2, breakfast: false })).toBe(300);
  });

  it('adds breakfast per guest and night', () => {
    const total = bookingTotal(stay, { nights: 3, guests: 2, breakfast: true });

    expect(total).toBe(300 + BREAKFAST_PER_GUEST_NIGHT * 2 * 3);
  });
});

describe('isoDate', () => {
  it('formats a local day as yyyy-mm-dd, padding month and day', () => {
    expect(isoDate(0, new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('rolls over months and years', () => {
    expect(isoDate(1, new Date(2026, 0, 31))).toBe('2026-02-01');
    expect(isoDate(2, new Date(2026, 11, 31))).toBe('2027-01-02');
  });
});
