import { Dialogs } from '@ng-native/device';
import { Storage } from '@ng-native/expo/store';
import { render, screen, userEvent } from '@ng-native/testing';
import { expect, it } from 'vitest';
import { isoDate } from '../../core/booking-rules.ts';
import { dateRange } from '../../core/dates.ts';
import type { Booking } from '../../core/models.ts';
import { BookingsPage } from './bookings.page.ts';

// Off a device `confirm()` always answers false, so the test stands in for the dialog.
// https://ng-native.com/packages/testing/testing-services

const booking: Booking = {
  id: 'b1',
  stayId: 'cusco-sanblas',
  stayName: 'Casa colonial en San Blas',
  city: 'Cusco',
  // Relative to today, so the booking stays upcoming whenever the suite runs.
  checkIn: isoDate(5),
  nights: 3,
  guests: 2,
  guestName: 'Ada Lovelace',
  email: 'ada@example.com',
  breakfast: false,
  total: 210,
};

async function renderWith(bookings: Booking[], answer = false) {
  const result = await render(BookingsPage, {
    providers: [{ provide: Dialogs, useValue: { confirm: async () => answer } }],
  });
  // The same key always returns the same signal, so this is what BookingsService reads.
  result.componentRef.injector.get(Storage).signal<Booking[]>('bookings', []).set(bookings);
  await result.detectChanges();
  return result;
}

it('says so when there are no bookings', async () => {
  await render(BookingsPage);

  expect(screen.getByText('Aún no tienes reservas')).toBeTruthy();
});

it('cancels a booking once confirmed', async () => {
  await renderWith([booking], true);
  expect(screen.getByText('Casa colonial en San Blas')).toBeTruthy();
  expect(screen.getByText('Próximas')).toBeTruthy();
  expect(screen.getByText(new RegExp(dateRange(booking)))).toBeTruthy();

  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Cancelar reserva en Casa colonial en San Blas' }));

  expect(await screen.findByText('Aún no tienes reservas')).toBeTruthy();
});

it('keeps the booking when the dialog is dismissed', async () => {
  await renderWith([booking], false);

  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Cancelar reserva en Casa colonial en San Blas' }));

  expect(screen.getByText('Casa colonial en San Blas')).toBeTruthy();
});

it('puts a stay that is over under Pasadas, without a cancel button', async () => {
  await renderWith([{ ...booking, id: 'old', checkIn: isoDate(-10), nights: 2 }]);

  expect(screen.getByText('Pasadas')).toBeTruthy();
  expect(screen.getByText('Completada')).toBeTruthy();
  expect(screen.queryByText('Próximas')).toBeNull();
  expect(screen.queryByRole('button', { name: /Cancelar reserva/ })).toBeNull();
});
