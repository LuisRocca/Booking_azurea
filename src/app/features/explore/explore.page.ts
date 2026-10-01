import { Component, computed, inject, resource, signal } from '@angular/core';
import { ActivityIndicator, ScrollView, Text, View } from '@ng-native/components';
import { NativeHeader, NativeHeaderItem, NativeSearchBar } from '@ng-native/router';
import { Aura } from '../../ui/aura.ts';
import { StaysService } from '../../core/stays.service.ts';
import { Button } from '../../ui/button.ts';
import { Chips } from '../../ui/chip.ts';
import { StayCard } from '../../ui/stay-card.ts';
import { CATEGORIES } from '../home/home.page.ts';

/**
 * The list of stays: loaded with `resource()` and filtered from the header's search bar and the
 * category chips, both at once. Each card rises in 60ms after the one above it.
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
    Aura,
    Button,
    Chips,
    NativeHeader,
    NativeHeaderItem,
    NativeSearchBar,
    ScrollView,
    StayCard,
    Text,
    View,
  ],
  template: `
    <native-header title="¿A dónde vamos?" [largeTitle]="true">
      <native-header-item type="searchBar">
        <native-search-bar placeholder="Ciudad o alojamiento" [(query)]="query" />
      </native-header-item>
    </native-header>
    <app-aura />

    @if (stays.isLoading()) {
      <view class="centered">
        <activity-indicator size="large" class="spinner" />
      </view>
    } @else if (stays.error()) {
      <view class="centered">
        <text class="muted">No se pudieron cargar los alojamientos.</text>
        <app-button label="Reintentar" (press)="stays.reload()" />
      </view>
    } @else {
      <scroll-view contentInsetAdjustmentBehavior="automatic" class="list">
        <view class="content">
          <app-chips [options]="categories" [(value)]="category" />
          @for (stay of shown(); track stay.id) {
            <app-stay-card
              class="rise"
              [stay]="stay"
              [link]="['/explore/stay', stay.id]"
            />
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
    .muted {
      color: var(--ink-muted);
      font-size: 14px;
      font-weight: 500;
    }
    /* Room for the tab bar, which Android draws over the end of the list. */
    .footer {
      text-align: center;
      padding-bottom: 120px;
    }
    .rise {
      animation: explore-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    /* The chips are child 1, so the cards are 2 onwards: 60ms apart. */
    .rise:nth-child(3) {
      animation-delay: 60ms;
    }
    .rise:nth-child(4) {
      animation-delay: 120ms;
    }
    .rise:nth-child(5) {
      animation-delay: 180ms;
    }
    .rise:nth-child(6) {
      animation-delay: 240ms;
    }
    .rise:nth-child(n + 7) {
      animation-delay: 300ms;
    }
    @keyframes explore-rise {
      from {
        opacity: 0;
        transform: translateY(12px);
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
export class ExplorePage {
  private readonly api = inject(StaysService);

  protected readonly categories = CATEGORIES;
  protected readonly category = signal<string>('Todo');
  protected readonly query = signal('');
  protected readonly stays = resource({ loader: () => this.api.list() });
  protected readonly shown = computed(() => {
    const query = this.query().trim().toLowerCase();
    const category = this.category();
    return (this.stays.value() ?? []).filter(
      (stay) =>
        (category === 'Todo' || stay.category === category) &&
        (!query || `${stay.name} ${stay.city}`.toLowerCase().includes(query)),
    );
  });
}
