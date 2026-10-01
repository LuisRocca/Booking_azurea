import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Pressable, ScrollView, Text, View } from '@ng-native/components';
import { Dialogs } from '@ng-native/device';
import { NativeHeader } from '@ng-native/router';
import { BookingsService } from '../../core/bookings.service.ts';
import { MONTHS, WEEKDAYS, dateRange, isPast, localDate } from '../../core/dates.ts';
import type { Booking } from '../../core/models.ts';
import { Aura } from '../../ui/aura.ts';
import { Badge } from '../../ui/badge.ts';
import { SectionHeader } from '../../ui/section-header.ts';

/**
 * The bookings kept on the device, upcoming first and then the ones already over. A handful of
 * rows, so a `<scroll-view>` rather than a `<virtual-list>`. Cancelling asks first, with the
 * platform's own confirmation dialog.
 *
 * https://ng-native.com/packages/device/dialogs
 * https://ng-native.com/packages/components/scroll-view
 */
@Component({
  selector: 'app-bookings',
  imports: [Aura, Badge, CurrencyPipe, NativeHeader, Pressable, ScrollView, SectionHeader, Text, View],
  template: `
    <native-header title="Mis reservas" [largeTitle]="true" />
    <app-aura />
    <scroll-view contentInsetAdjustmentBehavior="automatic" class="fill">
      <view class="body">
        @for (group of groups(); track group.title) {
          <app-section-header [title]="group.title" />
          <view class="list">
            @for (booking of group.bookings; track booking.id) {
              <view class="card rise" [attr.data-past]="group.past ? '' : null">
                <view class="top">
                  <view class="datebox" importantForAccessibility="no-hide-descendants">
                    <text class="datebox-small">{{ month(booking) }}</text>
                    <text class="datebox-day">{{ day(booking) }}</text>
                    <text class="datebox-small">{{ weekday(booking) }}</text>
                  </view>
                  <view class="fill">
                    <app-badge
                      [label]="group.past ? 'Completada' : 'Confirmada'"
                      [tone]="group.past ? 'glass' : 'success'"
                    />
                    <text class="name">{{ booking.stayName }}</text>
                    <text class="muted">
                      {{ booking.city }} · {{ range(booking) }} · {{ booking.guests }}
                      {{ booking.guests === 1 ? 'huésped' : 'huéspedes' }}
                    </text>
                  </view>
                </view>
                <view class="card-footer">
                  <text class="total">{{ booking.total | currency: 'USD' : 'symbol' : '1.0-0' }}</text>
                  @if (!group.past) {
                    <pressable
                      class="cancel-button"
                      accessibilityRole="button"
                      [accessibilityLabel]="'Cancelar reserva en ' + booking.stayName"
                      (press)="cancel(booking)"
                    >
                      <text class="cancel">Cancelar</text>
                    </pressable>
                  }
                </view>
              </view>
            }
          </view>
        } @empty {
          <view class="empty">
            <text class="empty-title">Aún no tienes reservas</text>
            <text class="muted center">Las que confirmes aparecerán aquí, incluso después de cerrar la app.</text>
          </view>
        }
      </view>
    </scroll-view>
  `,
  styles: `
    :host {
      flex: 1;
      background-color: var(--bg);
    }
    .fill {
      flex: 1;
    }
    /* Room for the tab bar, which Android draws over the end of the content. */
    .body {
      padding: 0 var(--space-5) 120px;
    }
    .list {
      gap: var(--space-3);
    }
    .card {
      padding: var(--space-3);
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: var(--radius-lg);
      background-color: var(--glass);
      box-shadow: var(--shadow-glass);
    }
    .card[data-past] {
      opacity: 0.8;
    }
    .top {
      flex-direction: row;
      gap: var(--space-3);
    }
    .datebox {
      width: 56px;
      align-items: center;
      justify-content: center;
      padding: var(--space-2) 0;
      border-radius: 14px;
      background-color: var(--royal-soft);
    }
    .datebox-small {
      color: var(--royal-strong);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }
    .datebox-day {
      color: var(--royal-strong);
      font-size: 22px;
      line-height: 26px;
      font-weight: 800;
    }
    .name {
      margin-top: var(--space-2);
      color: var(--ink);
      font-size: 16px;
      line-height: 21px;
      font-weight: 700;
    }
    .muted {
      color: var(--ink-muted);
      font-size: 13px;
      line-height: 18px;
      font-weight: 500;
    }
    .center {
      text-align: center;
    }
    .card-footer {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      min-height: 44px;
      margin-top: var(--space-3);
      padding-top: var(--space-2);
      border-top-width: 1px;
      border-color: var(--hairline);
    }
    .total {
      color: var(--ink);
      font-size: 18px;
      line-height: 22px;
      font-weight: 800;
    }
    .cancel-button {
      min-height: 44px;
      justify-content: center;
    }
    .cancel {
      color: var(--danger);
      font-size: 14px;
      font-weight: 600;
    }
    .empty {
      align-items: center;
      gap: var(--space-2);
      padding: 64px var(--space-6);
    }
    .empty-title {
      color: var(--ink);
      font-size: 17px;
      font-weight: 600;
    }
    .rise {
      animation: bookings-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .rise:nth-child(2) {
      animation-delay: 60ms;
    }
    .rise:nth-child(n + 3) {
      animation-delay: 120ms;
    }
    @keyframes bookings-rise {
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
export class BookingsPage {
  private readonly dialogs = inject(Dialogs);
  private readonly bookings = inject(BookingsService);

  /** Upcoming by arrival, soonest first; then past ones, most recent first. Empty groups drop. */
  protected readonly groups = computed(() => {
    const all = this.bookings.bookings();
    const byArrival = (a: Booking, b: Booking) => a.checkIn.localeCompare(b.checkIn);
    const upcoming = all.filter((booking) => !isPast(booking)).sort(byArrival);
    const past = all.filter((booking) => isPast(booking)).sort((a, b) => byArrival(b, a));
    return [
      { title: 'Próximas', past: false, bookings: upcoming },
      { title: 'Pasadas', past: true, bookings: past },
    ].filter((group) => group.bookings.length > 0);
  });

  protected range(booking: Booking): string {
    return dateRange(booking);
  }
  protected month(booking: Booking): string {
    return MONTHS[localDate(booking.checkIn).getMonth()];
  }
  protected day(booking: Booking): number {
    return localDate(booking.checkIn).getDate();
  }
  protected weekday(booking: Booking): string {
    return WEEKDAYS[localDate(booking.checkIn).getDay()];
  }

  protected async cancel(booking: Booking): Promise<void> {
    const sure = await this.dialogs.confirm('¿Cancelar esta reserva?', {
      message: `${booking.stayName}, ${dateRange(booking)}.`,
      confirm: 'Cancelar reserva',
      cancel: 'Mantener',
      destructive: true,
    });
    if (sure) this.bookings.cancel(booking.id);
  }
}
