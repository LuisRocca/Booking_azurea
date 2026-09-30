import { Dialogs } from '@ng-native/device';
import { Storage } from '@ng-native/expo/store';
import { render, screen, userEvent } from '@ng-native/testing';
import { expect, it } from 'vitest';
import type { Booking } from '../../core/models.ts';
import { BookingsPage } from './bookings.page.ts';

// Off a device `confirm()` always answers false, so the test stands in for the dialog.
// https://ng-native.com/packages/testing/testing-services

const booking: Booking = {
  id: 'b1',
  stayId: 'cusco-sanblas',
  stayName: 'Casa colonial en San Blas',
  city: 'Cusco',
  checkIn: '2026-10-05',
  nights: 3,
  guests: 2,
  guestName: 'Ada Lovelace',
  email: 'ada@example.com',
  breakfast: false,
  total: 210,
};

async function renderWithOneBooking(answer: boolean) {
  const result = await render(BookingsPage, {
    providers: [{ provide: Dialogs, useValue: { confirm: async () => answer } }],
  });
  // The same key always returns the same signal, so this is what BookingsService reads.
  result.componentRef.injector.get(Storage).signal<Booking[]>('bookings', []).set([booking]);
  await result.detectChanges();
  return result;
}

it('says so when there are no bookings', async () => {
  await render(BookingsPage);

  expect(screen.getByText('Aún no tienes reservas')).toBeTruthy();
});

it('cancels a booking once confirmed', async () => {
  await renderWithOneBooking(true);
  expect(screen.getByText('Casa colonial en San Blas')).toBeTruthy();
  expect(screen.getByText(/5–8 oct/)).toBeTruthy();

  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Cancelar reserva en Casa colonial en San Blas' }));

  expect(await screen.findByText('Aún no tienes reservas')).toBeTruthy();
});

it('keeps the booking when the dialog is dismissed', async () => {
  await renderWithOneBooking(false);

  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Cancelar reserva en Casa colonial en San Blas' }));

  expect(screen.getByText('Casa colonial en San Blas')).toBeTruthy();
});
