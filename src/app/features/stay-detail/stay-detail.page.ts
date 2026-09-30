import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, resource } from '@angular/core';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from '@ng-native/components';
import { NativeHeader, NativeNavigation, TabSafeAreaView } from '@ng-native/router';
import { StaysService } from '../../core/stays.service.ts';

/**
 * One stay, pushed inside the Explore tab. `id` is the route's `:id`, bound as an input by
 * `withComponentInputBinding()`, and the `resource()` reloads whenever it changes.
 *
 * https://ng-native.com/packages/router#setting-it-up
 * https://ng-native.com/packages/router/tabs#content-above-the-tab-bar
 */
@Component({
  selector: 'app-stay-detail',
  imports: [
    ActivityIndicator,
    CurrencyPipe,
    Image,
    NativeHeader,
    Pressable,
    ScrollView,
    TabSafeAreaView,
    Text,
    View,
  ],
  template: `
    <native-header [title]="stay.value()?.name ?? ''" backTitle="Explorar" />

    @if (stay.value(); as stay) {
      <scroll-view contentInsetAdjustmentBehavior="automatic" class="fill">
        <image [src]="stay.imageUrl" [alt]="'Foto de ' + stay.name" resizeMode="cover" class="photo" />
        <view class="body">
          <text class="name" accessibilityRole="header">{{ stay.name }}</text>
          <text class="muted">
            {{ stay.city }}, {{ stay.country }} · <text class="star">★</text> {{ stay.rating }} · hasta {{ stay.maxGuests }} huéspedes
          </text>
          <text class="description">{{ stay.description }}</text>

          <text class="section" accessibilityRole="header">Lo que ofrece</text>
          <view class="chips">
            @for (amenity of stay.amenities; track amenity) {
              <view class="chip"><text class="chip-label">{{ amenity }}</text></view>
            }
          </view>
        </view>
      </scroll-view>

      <view class="bar">
        <tab-safe-area-view [edges]="['bottom']" class="bar-content">
          <text class="price">
            {{ stay.pricePerNight | currency: 'USD' : 'symbol' : '1.0-0' }}
            <text class="unit"> / noche</text>
          </text>
          <pressable accessibilityRole="button" class="book" (press)="book(stay.id)">
            <text class="book-label">Reservar</text>
          </pressable>
        </tab-safe-area-view>
      </view>
    } @else if (stay.error()) {
      <view class="centered">
        <text class="muted">No encontramos este alojamiento.</text>
      </view>
    } @else {
      <view class="centered">
        <activity-indicator size="large" class="spinner" />
      </view>
    }
  `,
  styles: `
    :host {
      flex: 1;
      background-color: var(--bg);
      background-image: radial-gradient(circle at 90% 0%, var(--ice), var(--bg) 70%);
    }
    .fill {
      flex: 1;
    }
    .centered {
      flex: 1;
      align-items: center;
      justify-content: center;
    }
    .spinner {
      color: var(--royal);
    }
    .photo {
      height: 260px;
      margin: var(--space-2) var(--space-5) 0;
      border-radius: var(--radius-xl);
      background-color: var(--ice);
    }
    .body {
      gap: var(--space-2);
      padding: var(--space-6) var(--space-5) 40px;
    }
    .name {
      color: var(--ink);
      font-size: 22px;
      line-height: 28px;
      font-weight: 700;
      letter-spacing: -0.2px;
    }
    .muted {
      color: var(--ink-muted);
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
    }
    .star {
      color: var(--star);
    }
    .description {
      margin-top: var(--space-2);
      color: var(--ink);
      font-size: 15px;
      line-height: 22px;
    }
    .section {
      margin-top: var(--space-6);
      color: var(--ink);
      font-size: 17px;
      line-height: 22px;
      font-weight: 600;
    }
    .chips {
      flex-direction: row;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .chip {
      padding: var(--space-2) var(--space-3);
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: var(--radius-pill);
      background-color: var(--glass);
    }
    .chip-label {
      color: var(--ink);
      font-size: 14px;
      font-weight: 600;
    }
    /* The Dock: dense glass that reaches the bottom of the screen; its content stops above the tab bar. */
    .bar {
      border-top-width: 1px;
      border-color: var(--glass-border);
      border-top-left-radius: var(--radius-xl);
      border-top-right-radius: var(--radius-xl);
      background-color: var(--glass-strong);
      box-shadow: var(--shadow-float);
    }
    .bar-content {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-5);
    }
    .price {
      color: var(--ink);
      font-size: 20px;
      line-height: 24px;
      font-weight: 800;
    }
    .unit {
      color: var(--ink-subtle);
      font-size: 12px;
      font-weight: 500;
    }
    .book {
      min-height: 48px;
      justify-content: center;
      padding: 0 28px;
      border-radius: var(--radius-pill);
      background-color: var(--royal);
      box-shadow: var(--shadow-royal);
    }
    .book-label {
      color: var(--on-royal);
      font-size: 15px;
      font-weight: 700;
    }
  `,
})
export class StayDetailPage {
  private readonly api = inject(StaysService);
  private readonly nav = inject(NativeNavigation);

  readonly id = input.required<string>();
  protected readonly stay = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) => this.api.get(params.id),
  });

  /** A modal over the whole app, outside the tab's stack: see booking.page.ts. */
  protected book(stayId: string): void {
    void this.nav.present(['/book', stayId]);
  }
}
