import { render, screen, waitFor, type FakeFabricNode } from '@ng-native/testing';
import { expect, it } from 'vitest';
import { appProviders } from '../../app.config.ts';
import { App } from '../../app.ts';
import { isoDate } from '../../core/booking-rules.ts';
import { BookingsService } from '../../core/bookings.service.ts';

// The tab bar is native: its items are props on react-native-screens' tab screens, so the test
// reads them from the committed tree rather than querying text.
// https://ng-native.com/packages/router/tabs

/** The native tab screen whose item carries this title. */
function tab(nodes: readonly FakeFabricNode[], title: string): FakeFabricNode | undefined {
  for (const node of nodes) {
    if (/^RNSTabsScreen/.test(node.viewName) && node.props['title'] === title) return node;
    const found = tab(node.children, title);
    if (found) return found;
  }
  return undefined;
}

it('draws each tab with its Azurea icon as a tintable template', async () => {
  const { fabric } = await render(App, { providers: appProviders });
  await screen.findByText('Mejor valorados');

  expect(tab(fabric.committed, 'Inicio')?.props).toMatchObject({
    iconType: 'template',
    iconImageSource: expect.stringContaining('home.png'),
  });
  expect(tab(fabric.committed, 'Explorar')?.props['iconImageSource']).toContain('search.png');
  expect(tab(fabric.committed, 'Mis reservas')?.props['iconImageSource']).toContain('suitcase.png');
});

it('counts bookings in the Mis reservas badge, and shows none without them', async () => {
  const { fabric, componentRef } = await render(App, { providers: appProviders });
  await screen.findByText('Mejor valorados');
  expect(tab(fabric.committed, 'Mis reservas')?.props['badgeValue']).toBeUndefined();

  await componentRef.injector.get(BookingsService).create({
    stayId: 'lisbon-alfama',
    checkIn: isoDate(1),
    nights: 2,
    guests: 1,
    guestName: 'Ada Lovelace',
    email: 'ada@example.com',
    breakfast: false,
  });

  await waitFor(() => expect(tab(fabric.committed, 'Mis reservas')?.props['badgeValue']).toBe('1'));
});
