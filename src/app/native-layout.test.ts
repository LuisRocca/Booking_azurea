import { Router } from '@angular/router';
import { Text, View, VirtualList, VirtualListRow } from '@ng-native/components';
import { render, screen, type FakeFabricNode } from '@ng-native/testing';
import { expect, it } from 'vitest';
import { appProviders } from './app.config.ts';
import { App } from './app.ts';

// Android's ScrollView accepts exactly one child; a second one crashes the whole screen with
// "ScrollView can host only one direct child". The fake native layer does not enforce it and
// iOS does not mind, so this walks every screen and checks it. See KNOWN_ISSUES.md.

/** Every scroll view in the tree whose direct children number more than one. */
function crowdedScrollViews(nodes: readonly FakeFabricNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(/ScrollView$/.test(node.viewName) && node.children.length > 1
      ? [`${node.viewName} with ${node.children.length} children`]
      : []),
    ...crowdedScrollViews(node.children),
  ]);
}

/** Each screen of the app, with a text that says it has finished loading. */
const screens = [
  { url: '/home', ready: 'Mejor valorados' },
  { url: '/explore', ready: 'Loft en Alfama' },
  { url: '/bookings', ready: 'Aún no tienes reservas' },
  { url: '/home/stay/lisbon-alfama', ready: 'Lo que ofrece' },
  { url: '/book/lisbon-alfama', ready: 'Llegada' },
  { url: '/welcome', ready: 'Comenzar' },
];

it('gives every scroll view one direct child, as Android requires', async () => {
  const { fabric, componentRef } = await render(App, { providers: appProviders });
  const router = componentRef.injector.get(Router);

  for (const { url, ready } of screens) {
    await router.navigateByUrl(url);
    await screen.findAllByText(ready, {}, { timeout: 2000 });

    expect(crowdedScrollViews(fabric.committed), url).toEqual([]);
  }
});

it('catches the layout that crashed Android: a virtual list in @ng-native 0.1.3', async () => {
  const { fabric } = await render(
    `<virtual-list #list [items]="['a', 'b']" [itemHeight]="40">
      @for (row of list.window(); track row.slot) {
        <view [virtualListRow]="row"><text>{{ row.item }}</text></view>
      }
    </virtual-list>`,
    { imports: [VirtualList, VirtualListRow, View, Text] },
  );

  expect(crowdedScrollViews(fabric.committed)).not.toEqual([]);
});
