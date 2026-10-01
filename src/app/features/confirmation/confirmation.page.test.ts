import { Storage } from '@ng-native/expo/store';
import { render, screen } from '@ng-native/testing';
import { expect, it } from 'vitest';
import { appProviders } from '../../app.config.ts';
import type { Booking } from '../../core/models.ts';
import { ConfirmationPage } from './confirmation.page.ts';

const booking: Booking = {
  id: 'k3x9q2abc',
  stayId: 'cusco-sanblas',
  stayName: 'Casa colonial en San Blas',
  city: 'Cusco',
  checkIn: '2026-10-12',
  nights: 3,
  guests: 2,
  guestName: 'Ada Lovelace',
  email: 'ada@example.com',
  breakfast: false,
  total: 210,
};

it('shows the ticket of the booking in the url', async () => {
  const result = await render(ConfirmationPage, { inputs: { bookingId: booking.id }, providers: appProviders });
  result.componentRef.injector.get(Storage).signal<Booking[]>('bookings', []).set([booking]);
  await result.detectChanges();

  expect(screen.getByText('¡Reserva confirmada!')).toBeTruthy();
  expect(screen.getByText('Reserva AZ-K3X9Q2')).toBeTruthy();
  expect(screen.getByText('Casa colonial en San Blas')).toBeTruthy();
  expect(screen.getByText('Lun 12 oct')).toBeTruthy();
  expect(screen.getByText('Jue 15 oct')).toBeTruthy();
  expect(screen.getByText('$210')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Ver mis reservas' })).toBeTruthy();
});
