import { provideNativeRouter } from '@ng-native/router';
import { render, screen, userEvent } from '@ng-native/testing';
import { expect, it } from 'vitest';
import type { Stay } from '../../core/models.ts';
import { StaysService } from '../../core/stays.service.ts';
import { ExplorePage } from './explore.page.ts';

// The page alone, with the service replaced by a stand-in: no HttpClient, no fake API.
// https://ng-native.com/packages/testing/testing-services

const stay = (id: string, name: string, city: string, category: Stay['category']): Stay => ({
  id,
  name,
  city,
  country: 'País',
  category,
  pricePerNight: 100,
  rating: 4.5,
  maxGuests: 2,
  imageUrl: 'https://example.com/photo.jpg',
  description: '',
  amenities: [],
});

const stays = [
  stay('a', 'Loft en Alfama', 'Lisboa', 'Ciudad'),
  stay('b', 'Cabaña frente al lago', 'Bariloche', 'Montaña'),
];

it('filters the list from the search bar', async () => {
  await render(ExplorePage, {
    providers: [provideNativeRouter([]), { provide: StaysService, useValue: { list: async () => stays } }],
  });
  expect(await screen.findByText('2 alojamientos')).toBeTruthy();

  // The header's search bar takes typing like a text field.
  await userEvent.setup().type(screen.getByPlaceholderText('Ciudad o alojamiento'), 'barilo');

  expect(screen.getByText('1 alojamiento')).toBeTruthy();
  expect(screen.getByText('Cabaña frente al lago')).toBeTruthy();
  expect(screen.queryByText('Loft en Alfama')).toBeNull();
});

it('filters the list by category', async () => {
  await render(ExplorePage, {
    providers: [provideNativeRouter([]), { provide: StaysService, useValue: { list: async () => stays } }],
  });
  expect(await screen.findByText('2 alojamientos')).toBeTruthy();

  await userEvent.setup().press(screen.getByRole('radio', { name: 'Montaña' }));

  expect(screen.getByText('1 alojamiento')).toBeTruthy();
  expect(screen.getByRole('radio', { name: 'Montaña' }).props.accessibilityState).toMatchObject({ checked: true });
  expect(screen.queryByText('Loft en Alfama')).toBeNull();
});

it('offers a retry when the stays fail to load', async () => {
  await render(ExplorePage, {
    providers: [
      provideNativeRouter([]),
      { provide: StaysService, useValue: { list: async () => Promise.reject(new Error('offline')) } },
    ],
  });

  expect(await screen.findByRole('button', { name: 'Reintentar' })).toBeTruthy();
});
