import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, resource, signal } from '@angular/core';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from '@ng-native/components';
import {
  NativeHeader,
  NativeHeaderItem,
  NativeRouterLink,
  NativeSearchBar,
} from '@ng-native/router';
import { StaysService } from '../../core/stays.service.ts';

/**
 * The list of stays: loaded with `resource()` and filtered from the header's search bar.
 *
 * A handful of stays, so a `<scroll-view>`, which renders everything. A catalog that grows
 * without bound wants `<virtual-list>` instead, but see KNOWN_ISSUES.md: in @ng-native 0.1.3
 * it crashes on Android.
 *
 * https://ng-native.com/packages/components/scroll-view
 * https://ng-native.com/packages/router/header#search
 */
@Component({
  selector: 'app-explore',
  imports: [
    ActivityIndicator,
    CurrencyPipe,
    Image,
    NativeHeader,
    NativeHeaderItem,
    NativeRouterLink,
    NativeSearchBar,
    Pressable,
    ScrollView,
    Text,
    View,
  ],
  template: `
    <native-header title="¿A dónde vamos?" [largeTitle]="true">
      <native-header-item type="searchBar">
        <native-search-bar placeholder="Ciudad o alojamiento" [(query)]="query" />
      </native-header-item>
    </native-header>

    @if (stays.isLoading()) {
      <view class="centered">
        <activity-indicator size="large" class="spinner" />
      </view>
    } @else if (stays.error()) {
      <view class="centered">
        <text class="muted">No se pudieron cargar los alojamientos.</text>
        <pressable accessibilityRole="button" class="retry" (press)="stays.reload()">
          <text class="retry-label">Reintentar</text>
        </pressable>
      </view>
    } @else {
      <scroll-view contentInsetAdjustmentBehavior="automatic" class="list">
        <view class="content">
          @for (stay of shown(); track stay.id) {
            <pressable
              #card="pressable"
              accessibilityRole="button"
              [accessibilityLabel]="stay.name + ', ' + stay.city"
              [nativeRouterLink]="['/explore/stay', stay.id]"
              class="card"
              [style.opacity]="card.pressed() ? 0.7 : 1"
            >
              <image [src]="stay.imageUrl" resizeMode="cover" class="photo" />
              <view class="info">
                <view class="title-row">
                  <text class="name" [numberOfLines]="1">{{ stay.name }}</text>
                  <text class="rating"><text class="star">★</text> {{ stay.rating }}</text>
                </view>
                <text class="muted">{{ stay.city }}, {{ stay.country }}</text>
                <text class="price">
                  {{ stay.pricePerNight | currency: 'USD' : 'symbol' : '1.0-0' }}
                  <text class="unit"> / noche</text>
                </text>
              </view>
            </pressable>
          }
          <text class="muted footer">
            {{ shown().length }} {{ shown().length === 1 ? 'alojamiento' : 'alojamientos' }}
          </text>
        </view>
      </scroll-view>
    }
  `,
  styles: `
    /* Aura: the brand's soft blue light behind every screen, which the glass cards sit on. */
    :host {
      flex: 1;
      background-color: var(--bg);
      background-image: radial-gradient(circle at 90% 0%, var(--ice), var(--bg) 70%);
    }
    .centered {
      flex: 1;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-6);
    }
    .spinner {
      color: var(--royal);
    }
    .list {
      flex: 1;
    }
    .content {
      gap: var(--space-4);
      padding: var(--space-2) var(--space-5) 0;
    }
    /* Glass card: translucent fill, a bright 1px edge and a soft blue shadow. */
    .card {
      padding: var(--space-2);
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: var(--radius-lg);
      background-color: var(--glass);
      box-shadow: var(--shadow-glass);
    }
    /* Inner radius = outer radius - padding: 24 - 8. */
    .photo {
      height: 172px;
      border-radius: 16px;
      background-color: var(--ice);
    }
    .info {
      gap: 2px;
      padding: var(--space-3) var(--space-2) var(--space-2);
    }
    .title-row {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-2);
    }
    .name {
      flex: 1;
      color: var(--ink);
      font-size: 17px;
      line-height: 22px;
      font-weight: 600;
    }
    .rating {
      color: var(--ink);
      font-size: 14px;
      font-weight: 600;
    }
    .star {
      color: var(--star);
    }
    .price {
      margin-top: 2px;
      color: var(--ink);
      font-size: 20px;
      line-height: 24px;
      font-weight: 800;
      letter-spacing: -0.2px;
    }
    .muted {
      color: var(--ink-muted);
      font-size: 14px;
      font-weight: 500;
    }
    .unit {
      color: var(--ink-subtle);
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0;
    }
    .retry {
      min-height: 44px;
      justify-content: center;
      padding: 0 var(--space-6);
      border-radius: var(--radius-pill);
      background-color: var(--royal);
      box-shadow: var(--shadow-royal);
    }
    .retry-label {
      color: var(--on-royal);
      font-size: 14px;
      font-weight: 600;
    }
    /* Room for the tab bar, which Android draws over the end of the list. */
    .footer {
      text-align: center;
      padding-bottom: 120px;
    }
  `,
})
export class ExplorePage {
  private readonly api = inject(StaysService);

  protected readonly query = signal('');
  protected readonly stays = resource({ loader: () => this.api.list() });
  protected readonly shown = computed(() => {
    const query = this.query().trim().toLowerCase();
    const stays = this.stays.value() ?? [];
    if (!query) return stays;
    return stays.filter((stay) => `${stay.name} ${stay.city}`.toLowerCase().includes(query));
  });
}
