import { describe, expect, it } from 'vitest';
import { dateRange, isPast, localDate, shortDate } from './dates.ts';

describe('localDate', () => {
  it('reads yyyy-mm-dd as a local day, not UTC midnight', () => {
    const date = localDate('2026-10-05');

    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 5]);
  });

  it('adds days across a month', () => {
    expect(localDate('2026-10-30', 3).getDate()).toBe(2);
  });
});

describe('shortDate', () => {
  it('names the weekday and month in Spanish', () => {
    expect(shortDate(new Date(2026, 9, 12))).toBe('Lun 12 oct');
  });
});

describe('dateRange', () => {
  it('names the month once inside a month', () => {
    expect(dateRange({ checkIn: '2026-10-05', nights: 3 })).toBe('5–8 oct');
  });

  it('names both months across one', () => {
    expect(dateRange({ checkIn: '2026-10-30', nights: 3 })).toBe('30 oct–2 nov');
  });
});

describe('isPast', () => {
  const today = new Date(2026, 9, 10, 15, 0);

  it('is over once the check-out day is before today', () => {
    expect(isPast({ checkIn: '2026-10-05', nights: 3 }, today)).toBe(true);
  });

  it('is not over on the check-out day itself', () => {
    expect(isPast({ checkIn: '2026-10-07', nights: 3 }, today)).toBe(false);
  });

  it('is not over before it starts', () => {
    expect(isPast({ checkIn: '2026-10-20', nights: 2 }, today)).toBe(false);
  });
});
