import { render, screen, type FakeFabricNode } from '@ng-native/testing';
import { expect, it } from 'vitest';
import { appProviders } from '../../app.config.ts';
import { StayDetailPage } from './stay-detail.page.ts';

// The page alone, its `id` set the way the router's input binding would set it.
// https://ng-native.com/packages/testing/api#renderoptionst

/** The node directly holding the one with this tag. */
function parentOf(nodes: readonly FakeFabricNode[], tag: number): FakeFabricNode | undefined {
  for (const node of nodes) {
    if (node.children.some((child) => child.reactTag === tag)) return node;
    const found = parentOf(node.children, tag);
    if (found) return found;
  }
  return undefined;
}

/** Whether an image is drawn anywhere inside the node. */
function hasImage(node: FakeFabricNode | undefined): boolean {
  return !!node && (node.viewName === 'Image' || node.children.some(hasImage));
}

it('shows the stay with an icon before each amenity', async () => {
  const { fabric } = await render(StayDetailPage, {
    inputs: { id: 'cusco-sanblas' },
    providers: appProviders,
  });

  expect(await screen.findByText('Hasta 5 huéspedes')).toBeTruthy();
  expect(screen.getByText('Cusco, Perú')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Reservar' })).toBeTruthy();
  for (const amenity of ['Wifi', 'Chimenea', 'Desayuno disponible', 'Patio']) {
    const chip = parentOf(fabric.committed, screen.getByText(amenity).reactTag);
    expect(hasImage(chip), amenity).toBe(true);
  }
});

it('says so when the stay does not exist', async () => {
  await render(StayDetailPage, { inputs: { id: 'atlantis' }, providers: appProviders });

  expect(await screen.findByText('No encontramos este alojamiento.')).toBeTruthy();
});
