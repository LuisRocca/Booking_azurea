import { Component, signal } from '@angular/core';
import { render, screen, userEvent, type FakeFabricNode } from '@ng-native/testing';
import { expect, it } from 'vitest';
import { Chips } from './chip.ts';
import type { IconName } from './icon.ts';

@Component({
  selector: 'app-host',
  imports: [Chips],
  template: '<app-chips [options]="options" [icons]="icons" [(value)]="value" />',
})
class Host {
  readonly options = ['Todo', 'Playa'];
  readonly icons: Partial<Record<string, IconName>> = { Playa: 'beach' };
  readonly value = signal('Todo');
}

it('marks the chosen option and writes a press back through the model', async () => {
  const { instance } = await render(Host);
  const beach = screen.getByRole('radio', { name: 'Playa' });
  expect(beach.props['accessibilityState']).toMatchObject({ checked: false });

  await userEvent.setup().press(beach);

  expect(instance.value()).toBe('Playa');
  expect(screen.getByRole('radio', { name: 'Playa' }).props['accessibilityState']).toMatchObject({
    checked: true,
  });
});

/** Whether an image is drawn anywhere inside the node. */
function hasImage(node: FakeFabricNode): boolean {
  return node.viewName === 'Image' || node.children.some(hasImage);
}

it('puts an icon only before the options given one', async () => {
  await render(Host);

  expect(hasImage(screen.getByRole('radio', { name: 'Playa' }))).toBe(true);
  expect(hasImage(screen.getByRole('radio', { name: 'Todo' }))).toBe(false);
});
