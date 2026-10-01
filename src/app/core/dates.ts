import type { Booking } from './models.ts';

export const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** A `yyyy-mm-dd` as a local date. Built from its parts: `new Date('yyyy-mm-dd')` is UTC. */
export function localDate(iso: string, plusDays = 0): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day + plusDays);
}

/** "Lun 12 oct". */
export function shortDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "5–8 oct", or "30 oct–2 nov" across a month. */
export function dateRange(booking: Pick<Booking, 'checkIn' | 'nights'>): string {
  const start = localDate(booking.checkIn);
  const end = localDate(booking.checkIn, booking.nights);
  const endLabel = `${end.getDate()} ${MONTHS[end.getMonth()]}`;
  return start.getMonth() === end.getMonth()
    ? `${start.getDate()}–${endLabel}`
    : `${start.getDate()} ${MONTHS[start.getMonth()]}–${endLabel}`;
}

/** Whether the stay is over: its check-out day is before today. */
export function isPast(booking: Pick<Booking, 'checkIn' | 'nights'>, today = new Date()): boolean {
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return localDate(booking.checkIn, booking.nights) < midnight;
}
