import { Storage } from '@ng-native/expo/store';
import { render, screen, userEvent } from '@ng-native/testing';
import { Router } from '@angular/router';
import { expect, test } from 'vitest';
import { appProviders } from './app.config.ts';
import { App } from './app.ts';

// The whole app, with the same providers main.ts mounts it with: real router, real HttpClient,
// and the fake API answering from the interceptor.
// https://ng-native.com/packages/testing/testing-navigation

test('welcomes a first-time visitor once, then shows Home', async () => {
  const { componentRef } = await render(App, { providers: appProviders });

  const start = await screen.findByRole('button', { name: 'Comenzar' });
  expect(screen.getByText('Reserva lugares que se sienten bien.')).toBeTruthy();
  await userEvent.setup().press(start);

  expect(await screen.findByText('¿A dónde vamos?')).toBeTruthy();
  expect(componentRef.injector.get(Storage).signal('welcomed', false)()).toBe(true);
  await expect.poll(() => screen.queryByRole('button', { name: 'Comenzar' })).toBeNull();
});

test('opens a stay from the Home carousel', async () => {
  const { componentRef } = await render(App, { providers: appProviders });
  componentRef.injector.get(Storage).signal('welcomed', false).set(true);

  const card = await screen.findByRole('button', { name: 'Loft en Alfama, Lisboa' });
  await userEvent.setup().press(card);

  expect(await screen.findByText(/a dos calles del tranvía 28/)).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Reservar' })).toBeTruthy();
});

test('books a stay and lands on the confirmation', async () => {
  const { componentRef } = await render(App, { providers: appProviders });
  componentRef.injector.get(Storage).signal('welcomed', false).set(true);
  const user = userEvent.setup();

  await user.press(await screen.findByRole('button', { name: 'Loft en Alfama, Lisboa' }));
  await user.press(await screen.findByRole('button', { name: 'Reservar' }));

  // Tomorrow is always free: the fake API only refuses the day after.
  const [firstDay] = await screen.findAllByRole('radio', { name: /^(Dom|Lun|Mar|Mié|Jue|Vie|Sáb) \d+$/ });
  await user.press(firstDay);
  await user.type(screen.getByLabelText('Nombre'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.press(screen.getByRole('button', { name: 'Confirmar' }));

  expect(await screen.findByText('¡Reserva confirmada!')).toBeTruthy();
  expect(screen.getByText(/^Reserva AZ-/)).toBeTruthy();

  await user.press(screen.getByRole('button', { name: 'Ver mis reservas' }));

  await expect.poll(() => componentRef.injector.get(Router).url).toBe('/bookings');
  expect(await screen.findByText('Próximas')).toBeTruthy();
  await expect.poll(() => screen.queryByText('¡Reserva confirmada!')).toBeNull();
  expect(screen.getByRole('button', { name: 'Cancelar reserva en Loft en Alfama' })).toBeTruthy();
});
