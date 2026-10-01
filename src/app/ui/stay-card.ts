import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Image, Pressable, Text, View } from '@ng-native/components';
import { NativeRouterLink } from '@ng-native/router';
import type { Stay } from '../core/models.ts';
import { Icon } from './icon.ts';

/**
 * A stay as a glass card, in two shapes: `tall` for the sideways carousel on Home, `row` for
 * vertical lists. The whole card is one button that pushes the stay's detail onto the stack of
 * the tab it is in, which is why the caller passes `link`.
 *
 * Inner radius = outer radius - padding: an 18pt photo inside a 24pt card with 8pt of padding.
 *
 * https://ng-native.com/packages/router#links
 * https://ng-native.com/packages/components/image
 */
@Component({
  selector: 'app-stay-card',
  imports: [CurrencyPipe, Icon, Image, NativeRouterLink, Pressable, Text, View],
  template: `
    <pressable
      #card="pressable"
      accessibilityRole="button"
      [accessibilityLabel]="stay().name + ', ' + stay().city"
      [nativeRouterLink]="link()"
      class="card"
      [attr.data-layout]="layout()"
      [attr.data-pressed]="card.pressed() ? '' : null"
    >
      <image [src]="stay().imageUrl" resizeMode="cover" class="photo" />
      <view class="info">
        <view class="title-row">
          <text class="name" [numberOfLines]="1">{{ stay().name }}</text>
          <view class="rating">
            <app-icon name="star-filled" tone="star" [size]="14" />
            <text class="rating-value">{{ stay().rating }}</text>
          </view>
        </view>
        <text class="place" [numberOfLines]="1">{{ stay().city }}, {{ stay().country }}</text>
        <text class="price">
          {{ stay().pricePerNight | currency: 'USD' : 'symbol' : '1.0-0' }}<text class="unit"> / noche</text>
        </text>
      </view>
    </pressable>
  `,
  styles: `
    .card {
      padding: var(--space-2);
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: var(--radius-lg);
      background-color: var(--glass);
      box-shadow: var(--shadow-glass);
      transform: scale(1);
      transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .card[data-pressed] {
      transform: scale(0.98);
    }
    .card[data-layout='tall'] {
      width: 232px;
    }
    .card[data-layout='row'] {
      flex-direction: row;
      gap: var(--space-3);
    }
    .photo {
      border-radius: 18px;
      background-color: var(--ice);
    }
    .card[data-layout='tall'] .photo {
      height: 200px;
    }
    .card[data-layout='row'] .photo {
      width: 104px;
      height: 104px;
    }
    .info {
      gap: 2px;
      padding: var(--space-3) var(--space-2) var(--space-1);
    }
    .card[data-layout='row'] .info {
      flex: 1;
      justify-content: center;
      padding: var(--space-1) var(--space-2) var(--space-1) 0;
    }
    .title-row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }
    .name {
      flex: 1;
      color: var(--ink);
      font-size: 16px;
      line-height: 21px;
      font-weight: 700;
    }
    .rating {
      flex-direction: row;
      align-items: center;
      gap: 3px;
    }
    .rating-value {
      color: var(--ink);
      font-size: 13px;
      font-weight: 700;
    }
    .place {
      color: var(--ink-muted);
      font-size: 13px;
      line-height: 18px;
      font-weight: 500;
    }
    .price {
      margin-top: var(--space-1);
      color: var(--ink);
      font-size: 18px;
      line-height: 22px;
      font-weight: 800;
    }
    .unit {
      color: var(--ink-subtle);
      font-size: 12px;
      font-weight: 500;
    }
  `,
})
export class StayCard {
  readonly stay = input.required<Stay>();
  readonly link = input.required<readonly unknown[]>();
  readonly layout = input<'tall' | 'row'>('row');
}
