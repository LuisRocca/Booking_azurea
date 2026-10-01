import { provideNativeRouter } from '@ng-native/router';
import { render, screen, userEvent } from '@ng-native/testing';
import { expect, it } from 'vitest';
import type { Stay } from '../../core/models.ts';
import { StaysService } from '../../core/stays.service.ts';
import { HomePage } from './home.page.ts';

// The page alone, with the service replaced by a stand-in.
// https://ng-native.com/packages/testing/testing-services

const stay = (id: string, category: Stay['category'], rating: number, pricePerNight: number): Stay => ({
  id,
  name: `Stay ${id}`,
  city: `City ${id}`,
  country: 'País',
  category,
  pricePerNight,
  rating,
  maxGuests: 2,
  imageUrl: 'https://example.com/photo.jpg',
  description: '',
  amenities: [],
});

const stays = [
  stay('a', 'Ciudad', 4.9, 120),
  stay('b', 'Playa', 4.8, 90),
  stay('c', 'Montaña', 4.7, 70),
  stay('d', 'Ciudad', 4.2, 50),
  stay('e', 'Playa', 4.1, 40),
];

async function renderHome() {
  await render(HomePage, {
    providers: [provideNativeRouter([]), { provide: StaysService, useValue: { list: async () => stays } }],
  });
  await screen.findByText('Mejor valorados');
}

it('puts the best rated in the carousel and the rest by price', async () => {
  await renderHome();

  for (const id of ['a', 'b', 'c']) {
    expect(screen.getByRole('button', { name: `Stay ${id}, City ${id}` })).toBeTruthy();
  }
  expect(screen.getByText('Buenos precios')).toBeTruthy();
  const rest = screen.getAllByRole('button', { name: /Stay [de],/ }).map((node) => node.props.accessibilityLabel);
  expect(rest).toEqual(['Stay e, City e', 'Stay d, City d']); // cheapest first
});

it('filters both sections by category', async () => {
  await renderHome();

  await userEvent.setup().press(screen.getByRole('radio', { name: 'Playa' }));

  expect(screen.getByRole('button', { name: 'Stay b, City b' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Stay e, City e' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Stay a, City a' })).toBeNull();
  expect(screen.queryByText('Buenos precios')).toBeNull(); // both beach stays fit the carousel
});
