import { Component, computed, inject, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@ng-native/components';
import { NativeHeader } from '@ng-native/router';
import type { Stay } from '../../core/models.ts';
import { StaysService } from '../../core/stays.service.ts';
import { Aura } from '../../ui/aura.ts';
import { Button } from '../../ui/button.ts';
import { Chips } from '../../ui/chip.ts';
import { Icon, type IconName } from '../../ui/icon.ts';
import { SectionHeader } from '../../ui/section-header.ts';
import { StayCard } from '../../ui/stay-card.ts';

export const CATEGORIES = ['Todo', 'Ciudad', 'Playa', 'Montaña'] as const;
export const CATEGORY_ICONS: Record<(typeof CATEGORIES)[number], IconName> = {
  Todo: 'grid',
  Ciudad: 'building',
  Playa: 'beach',
  Montaña: 'mountain',
};

/** The best-rated stays go in the carousel; everything else, cheapest first, in the list. */
const CAROUSEL_SIZE = 3;

/** "Buenos días" until noon, "Buenas tardes" until 7 pm, then "Buenas noches". */
function greeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Buenos días';
  return hour < 19 ? 'Buenas tardes' : 'Buenas noches';
}

/**
 * The first tab: a greeting, a search pill that opens Explore, category chips, the best-rated
 * stays in a sideways carousel and the rest as a list. Its own header is hidden - the greeting is
 * the header - so it brings its own top inset with `<safe-area-view>`.
 *
 * Each block rises into place on arrival, 70ms after the one above it: one `@keyframes`, and a
 * delay class per block. Only opacity and transform move.
 *
 * https://ng-native.com/packages/router/header
 * https://ng-native.com/packages/components/scroll-view
 * https://ng-native.com/packages/fabric/animation
 */
@Component({
  selector: 'app-home',
  imports: [
    ActivityIndicator,
    Aura,
    Button,
    Chips,
    Icon,
    NativeHeader,
    Pressable,
    SafeAreaView,
    ScrollView,
    SectionHeader,
    StayCard,
    Text,
    View,
  ],
  template: `
    <native-header title="Inicio" [hidden]="true" />
    <app-aura />

    <safe-area-view class="fill" [edges]="['top']">
      <scroll-view class="fill" [showsVerticalScrollIndicator]="false">
        <view class="content">
          <view class="rise">
            <text class="caption">{{ hello }}</text>
            <text class="title" accessibilityRole="header">¿A dónde vamos?</text>
          </view>

          <pressable
            #search="pressable"
            accessibilityRole="search"
            accessibilityLabel="Buscar un destino"
            class="search rise d1"
            [attr.data-pressed]="search.pressed() ? '' : null"
            (press)="openExplore()"
          >
            <view class="search-icon">
              <app-icon name="search" tone="on-royal" [size]="22" />
            </view>
            <view class="fill">
              <text class="search-main">Busca un destino</text>
              <text class="caption">Ciudad, playa o montaña</text>
            </view>
          </pressable>

          <view class="rise d2">
            <app-chips [options]="categories" [icons]="categoryIcons" [(value)]="category" />
          </view>

          @if (stays.isLoading()) {
            <view class="centered">
              <activity-indicator size="large" class="spinner" />
            </view>
          } @else if (stays.error()) {
            <view class="centered">
              <text class="muted">No se pudieron cargar los alojamientos.</text>
              <app-button label="Reintentar" (press)="stays.reload()" />
            </view>
          } @else if (carousel().length === 0) {
            <view class="centered">
              <text class="muted">Aún no hay alojamientos de {{ category().toLowerCase() }}.</text>
            </view>
          } @else {
            <view class="rise d3">
              <app-section-header title="Mejor valorados" action="Ver todo" (actionPress)="openExplore()" />
              <scroll-view [horizontal]="true" [showsHorizontalScrollIndicator]="false" class="carousel">
                <view class="carousel-row">
                  @for (stay of carousel(); track stay.id) {
                    <app-stay-card [stay]="stay" [link]="['/home/stay', stay.id]" layout="tall" />
                  }
                </view>
              </scroll-view>
            </view>

            @if (rest().length > 0) {
              <view class="rise d4">
                <app-section-header title="Buenos precios" />
                <view class="list">
                  @for (stay of rest(); track stay.id) {
                    <app-stay-card [stay]="stay" [link]="['/home/stay', stay.id]" />
                  }
                </view>
              </view>
            }
          }
        </view>
      </scroll-view>
    </safe-area-view>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .fill {
      flex: 1;
    }
    /* Room for the tab bar, which Android draws over the end of the content. */
    .content {
      padding: var(--space-3) var(--space-5) 120px;
    }
    .caption {
      color: var(--ink-subtle);
      font-size: 12px;
      line-height: 16px;
      font-weight: 600;
    }
    .title {
      color: var(--ink);
      font-size: 28px;
      line-height: 34px;
      font-weight: 700;
      letter-spacing: -0.4px;
    }
    .search {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      min-height: 60px;
      margin: var(--space-4) 0;
      padding: 0 var(--space-4) 0 6px;
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: var(--radius-pill);
      background-color: var(--glass-strong);
      box-shadow: var(--shadow-glass);
      transform: scale(1);
      transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .search[data-pressed] {
      transform: scale(0.98);
    }
    .search-icon {
      width: 48px;
      height: 48px;
      align-items: center;
      justify-content: center;
      border-radius: 24px;
      background-color: var(--royal);
      box-shadow: var(--shadow-royal);
    }
    .search-main {
      color: var(--ink);
      font-size: 15px;
      line-height: 20px;
      font-weight: 700;
    }
    .carousel {
      flex-grow: 0;
      margin: 0 calc(var(--space-5) * -1);
    }
    .carousel-row {
      flex-direction: row;
      gap: var(--space-3);
      padding: var(--space-1) var(--space-5) var(--space-3);
    }
    .list {
      gap: var(--space-3);
    }
    .centered {
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-10) var(--space-6);
    }
    .spinner {
      color: var(--royal);
    }
    .muted {
      color: var(--ink-muted);
      font-size: 14px;
      font-weight: 500;
      text-align: center;
    }
    .rise {
      animation: home-rise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .d1 {
      animation-delay: 70ms;
    }
    .d2 {
      animation-delay: 140ms;
    }
    .d3 {
      animation-delay: 210ms;
    }
    .d4 {
      animation-delay: 280ms;
    }
    @keyframes home-rise {
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
export class HomePage {
  private readonly api = inject(StaysService);
  private readonly router = inject(Router);

  protected readonly hello = greeting();
  protected readonly categories = CATEGORIES;
  protected readonly categoryIcons = CATEGORY_ICONS;
  protected readonly category = signal<string>('Todo');
  protected readonly stays = resource({ loader: () => this.api.list() });

  private readonly filtered = computed<readonly Stay[]>(() => {
    const all = this.stays.hasValue() ? this.stays.value() : [];
    const category = this.category();
    return category === 'Todo' ? all : all.filter((stay) => stay.category === category);
  });
  protected readonly carousel = computed(() =>
    [...this.filtered()].sort((a, b) => b.rating - a.rating).slice(0, CAROUSEL_SIZE),
  );
  protected readonly rest = computed(() => {
    const shown = new Set(this.carousel().map((stay) => stay.id));
    return this.filtered()
      .filter((stay) => !shown.has(stay.id))
      .sort((a, b) => a.pricePerNight - b.pricePerNight);
  });

  /** Switches to the Explore tab, where the search bar is. */
  protected openExplore(): void {
    void this.router.navigateByUrl('/explore');
  }
}
