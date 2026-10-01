import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, resource } from '@angular/core';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
} from '@ng-native/components';
import { NativeHeader, NativeNavigation, TabSafeAreaView } from '@ng-native/router';
import { StaysService } from '../../core/stays.service.ts';
import { Aura } from '../../ui/aura.ts';
import { Badge } from '../../ui/badge.ts';
import { Button } from '../../ui/button.ts';
import { Icon, type IconName } from '../../ui/icon.ts';

/** The icon for each amenity in the data; one not listed here gets a sparkle. */
const AMENITY_ICONS: Record<string, IconName> = {
  Wifi: 'wifi',
  Cocina: 'utensils',
  'Aire acondicionado': 'snowflake',
  'Vistas al río': 'waves',
  Terraza: 'sun',
  Lavadora: 'washer',
  Chimenea: 'flame',
  'Desayuno disponible': 'coffee',
  Patio: 'leaf',
  Escritorio: 'laptop',
  Gimnasio: 'dumbbell',
  Piscina: 'waves',
  Azotea: 'sun',
  'Estufa a leña': 'flame',
  Muelle: 'waves',
  Estacionamiento: 'pin',
};

/**
 * One stay, pushed inside the Home or the Explore tab. `id` is the route's `:id`, bound as an input by
 * `withComponentInputBinding()`, and the `resource()` reloads whenever it changes.
 *
 * https://ng-native.com/packages/router#setting-it-up
 * https://ng-native.com/packages/router/tabs#content-above-the-tab-bar
 */
@Component({
  selector: 'app-stay-detail',
  imports: [
    ActivityIndicator,
    Aura,
    Badge,
    Button,
    CurrencyPipe,
    Icon,
    Image,
    NativeHeader,
    ScrollView,
    TabSafeAreaView,
    Text,
    View,
  ],
  template: `
    <native-header [title]="stay.value()?.name ?? ''" />
    <app-aura />

    @if (stay.value(); as stay) {
      <scroll-view contentInsetAdjustmentBehavior="automatic" class="fill">
        <view class="hero">
          <image [src]="stay.imageUrl" [alt]="'Foto de ' + stay.name" resizeMode="cover" class="photo" />
          <view class="hero-badge">
            <app-badge [label]="stay.category" tone="glass" />
          </view>
        </view>
        <view class="body rise">
          <view class="title-row">
            <view class="place">
              <app-icon name="pin" tone="royal-strong" [size]="14" />
              <text class="overline">{{ stay.city }}, {{ stay.country }}</text>
            </view>
            <view class="rating">
              <app-icon name="star-filled" tone="star" [size]="16" />
              <text class="rating-value">{{ stay.rating }}</text>
            </view>
          </view>
          <text class="name" accessibilityRole="header">{{ stay.name }}</text>
          <text class="muted">Hasta {{ stay.maxGuests }} huéspedes</text>
          <text class="description">{{ stay.description }}</text>

          <text class="section" accessibilityRole="header">Lo que ofrece</text>
          <view class="chips">
            @for (amenity of stay.amenities; track amenity) {
              <view class="chip">
                <app-icon [name]="amenityIcon(amenity)" tone="royal" [size]="18" />
                <text class="chip-label">{{ amenity }}</text>
              </view>
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
          <app-button label="Reservar" size="lg" (press)="book(stay.id)" />
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
    .hero {
      margin: var(--space-2) var(--space-5) 0;
    }
    .photo {
      height: 300px;
      border-radius: var(--radius-xl);
      background-color: var(--ice);
    }
    .hero-badge {
      position: absolute;
      top: var(--space-4);
      left: var(--space-4);
    }
    .title-row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .overline {
      color: var(--royal-strong);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.9px;
      text-transform: uppercase;
    }
    .place,
    .rating {
      flex-direction: row;
      align-items: center;
      gap: var(--space-1);
    }
    .rating-value {
      color: var(--ink);
      font-size: 14px;
      font-weight: 700;
    }
    .body {
      gap: var(--space-2);
      padding: var(--space-6) var(--space-5) 40px;
    }
    .name {
      color: var(--ink);
      font-size: 28px;
      line-height: 34px;
      font-weight: 700;
      letter-spacing: -0.2px;
    }
    .muted {
      color: var(--ink-muted);
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
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
      flex-direction: row;
      align-items: center;
      gap: var(--space-2);
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
    .rise {
      animation: detail-rise 520ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both;
    }
    @keyframes detail-rise {
      from {
        opacity: 0;
        transform: translateY(14px);
      }
      to {
        opacity: 1;
        transform: translateY(0px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .rise {
        animation-name: none;
      }
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

  protected amenityIcon(amenity: string): IconName {
    return AMENITY_ICONS[amenity] ?? 'sparkle';
  }

  /** A modal over the whole app, outside the tab's stack: see booking.page.ts. */
  protected book(stayId: string): void {
    void this.nav.present(['/book', stayId]);
  }
}
