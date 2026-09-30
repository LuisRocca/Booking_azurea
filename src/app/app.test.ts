import { render, screen, userEvent } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { appProviders } from './app.config.ts';
import { App } from './app.ts';

// The whole app, with the same providers main.ts mounts it with: real router, real HttpClient,
// and the fake API answering from the interceptor.
// https://ng-native.com/packages/testing/testing-navigation

test('lists the stays and opens one', async () => {
  await render(App, { providers: appProviders });

  const card = await screen.findByRole('button', { name: 'Loft en Alfama, Lisboa' });
  await userEvent.setup().press(card);

  expect(await screen.findByText(/a dos calles del tranvía 28/)).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Reservar' })).toBeTruthy();
});
