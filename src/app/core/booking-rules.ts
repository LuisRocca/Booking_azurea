import type { BookingRequest, Stay } from './models.ts';

/** Shared by the form's live price and the fake API, so both always agree. */
export const BREAKFAST_PER_GUEST_NIGHT = 12;

export function bookingTotal(
  stay: Pick<Stay, 'pricePerNight'>,
  request: Pick<BookingRequest, 'nights' | 'guests' | 'breakfast'>,
): number {
  const breakfast = request.breakfast ? BREAKFAST_PER_GUEST_NIGHT * request.guests : 0;
  return (stay.pricePerNight + breakfast) * request.nights;
}

/** `yyyy-mm-dd` for the local day `offset` days from today. */
export function isoDate(offset: number, from = new Date()): string {
  const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset);
  const month = String(day.getMonth() + 1).padStart(2, '0');
  const date = String(day.getDate()).padStart(2, '0');
  return `${day.getFullYear()}-${month}-${date}`;
}
