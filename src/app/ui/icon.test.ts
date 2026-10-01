import { render, screen } from '@ng-native/testing';
import { expect, it } from 'vitest';
import { Icon } from './icon.ts';

// The design tokens live on the app root; here they are set on the test's own root instead.
const tokens = '--ink: #0b1638; --royal: #2f5bea; --star: #e8a200;';

it('tints the icon with the token its tone names', async () => {
  await render(`<view style="${tokens}"><app-icon name="star-filled" tone="star" label="Valoración" /></view>`, {
    imports: [Icon],
  });

  expect(screen.getByLabelText('Valoración').props['tintColor']).toBe('#e8a200');
});

it('is sized from its input, and decorative without a label', async () => {
  const { fabric } = await render(`<view style="${tokens}"><app-icon name="search" [size]="22" /></view>`, {
    imports: [Icon],
  });

  const image = fabric.find('Image');
  expect(image?.props).toMatchObject({ width: 22, height: 22, tintColor: '#0b1638' });
  expect(image?.props['accessible']).toBeFalsy();
});
