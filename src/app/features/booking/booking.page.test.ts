import { fireEvent, render, screen, userEvent } from '@ng-native/testing';
import { expect, it } from 'vitest';
import { appProviders } from '../../app.config.ts';
import { isoDate } from '../../core/booking-rules.ts';
import { BookingsService } from '../../core/bookings.service.ts';
import { FULLY_BOOKED_DAY_OFFSET } from '../../core/mock-api/mock-api.interceptor.ts';
import { BookingPage } from './booking.page.ts';

// https://ng-native.com/packages/testing/testing-forms

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** The accessible name of the check-in chip `offset` days from today, e.g. "Lun 6". */
function dayLabel(offset: number): string {
  const date = new Date(`${isoDate(offset)}T12:00:00`);
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()}`;
}

async function renderBooking() {
  const result = await render(BookingPage, {
    inputs: { stayId: 'lisbon-alfama' },
    providers: appProviders,
  });
  await screen.findByText('Loft en Alfama');
  return result;
}

async function fillIn(dayOffset: number): Promise<ReturnType<typeof userEvent.setup>> {
  const user = userEvent.setup();
  await user.press(screen.getByRole('radio', { name: dayLabel(dayOffset) }));
  await user.type(screen.getByLabelText('Nombre'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  return user;
}

it('shows every error at once when submitted empty', async () => {
  await renderBooking();

  await userEvent.setup().press(screen.getByRole('button', { name: 'Confirmar' }));

  expect(screen.getByText('Elige el día de llegada.')).toBeTruthy();
  expect(screen.getByText('Escribe tu nombre.')).toBeTruthy();
  expect(screen.getByText('Escribe tu email.')).toBeTruthy();
});

it('updates the total as the stay changes', async () => {
  await renderBooking();
  const user = userEvent.setup();
  expect(screen.getByText('$190')).toBeTruthy(); // 2 nights at $95

  await user.press(screen.getByRole('button', { name: 'Una noche más' }));
  // A switch is not pressed: native sends it a change event with its new value.
  await fireEvent(screen.getByRole('switch', { name: 'Desayuno' }), 'change', { value: true });

  expect(screen.getByText('$321')).toBeTruthy(); // 3 × ($95 + $12 breakfast)
});

it('shows the error the API returns next to the field it belongs to', async () => {
  const { componentRef } = await renderBooking();
  const user = await fillIn(FULLY_BOOKED_DAY_OFFSET);

  await user.press(screen.getByRole('button', { name: 'Confirmar' }));

  expect(await screen.findByText('Ya no hay disponibilidad ese día.')).toBeTruthy();
  expect(componentRef.injector.get(BookingsService).bookings()).toEqual([]);
});

it('saves a valid booking', async () => {
  const { componentRef } = await renderBooking();
  const user = await fillIn(1);

  await user.press(screen.getByRole('button', { name: 'Confirmar' }));

  const bookings = componentRef.injector.get(BookingsService);
  await expect.poll(() => bookings.bookings().length).toBe(1);
  expect(bookings.bookings()[0]).toMatchObject({
    stayName: 'Loft en Alfama',
    checkIn: isoDate(1),
    guestName: 'Ada Lovelace',
    total: 190,
  });
});
