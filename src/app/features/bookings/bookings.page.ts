import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Pressable, ScrollView, Text, View } from '@ng-native/components';
import { Dialogs } from '@ng-native/device';
import { NativeHeader } from '@ng-native/router';
import { BookingsService } from '../../core/bookings.service.ts';
import type { Booking } from '../../core/models.ts';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * The bookings kept on the device. A handful of rows, so a `<scroll-view>` rather than a
 * `<virtual-list>`. Cancelling asks first, with the platform's own confirmation dialog.
 *
 * https://ng-native.com/packages/device/dialogs
 * https://ng-native.com/packages/components/scroll-view
 */
@Component({
  selector: 'app-bookings',
  imports: [CurrencyPipe, NativeHeader, Pressable, ScrollView, Text, View],
  template: `
    <native-header title="Mis reservas" [largeTitle]="true" />
    <scroll-view contentInsetAdjustmentBehavior="automatic" class="fill">
      <view class="body">
        @for (booking of bookings.bookings(); track booking.id) {
          <view class="card">
            <view class="status">
              <view class="dot"></view>
              <text class="status-label">Confirmada</text>
            </view>
            <text class="name">{{ booking.stayName }}</text>
            <text class="muted">
              {{ booking.city }} · {{ dateRange(booking) }} · {{ booking.guests }}
              {{ booking.guests === 1 ? 'huésped' : 'huéspedes' }}
            </text>
            <view class="card-footer">
              <text class="total">{{ booking.total | currency: 'USD' : 'symbol' : '1.0-0' }}</text>
              <pressable
                class="cancel-button"
                accessibilityRole="button"
                [accessibilityLabel]="'Cancelar reserva en ' + booking.stayName"
                (press)="cancel(booking)"
              >
                <text class="cancel">Cancelar</text>
              </pressable>
            </view>
          </view>
        } @empty {
          <view class="empty">
            <text class="empty-title">Aún no tienes reservas</text>
            <text class="muted">Las que confirmes aparecerán aquí, incluso después de cerrar la app.</text>
          </view>
        }
      </view>
    </scroll-view>
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
    /* Room for the tab bar, which Android draws over the end of the content. */
    .body {
      gap: var(--space-4);
      padding: var(--space-2) var(--space-5) 120px;
    }
    .card {
      gap: 4px;
      padding: var(--space-4);
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: var(--radius-lg);
      background-color: var(--glass);
      box-shadow: var(--shadow-glass);
    }
    .status {
      flex-direction: row;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 4px;
      background-color: var(--success);
    }
    .status-label {
      color: var(--success);
      font-size: 12px;
      font-weight: 600;
    }
    .name {
      margin-top: var(--space-2);
      color: var(--ink);
      font-size: 17px;
      line-height: 22px;
      font-weight: 600;
    }
    .muted {
      color: var(--ink-muted);
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
      text-align: center;
    }
    .card .muted {
      text-align: left;
    }
    .card-footer {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      margin-top: var(--space-3);
      padding-top: var(--space-3);
      border-top-width: 1px;
      border-color: var(--hairline);
    }
    .total {
      color: var(--ink);
      font-size: 20px;
      line-height: 24px;
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
  `,
})
export class BookingsPage {
  private readonly dialogs = inject(Dialogs);
  protected readonly bookings = inject(BookingsService);

  /** "5–8 oct", or "30 oct–2 nov" across a month. Built from local parts: `new Date('yyyy-mm-dd')` is UTC. */
  protected dateRange(booking: Booking): string {
    const [year, month, day] = booking.checkIn.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day + booking.nights);
    const endLabel = `${end.getDate()} ${MONTHS[end.getMonth()]}`;
    return start.getMonth() === end.getMonth()
      ? `${start.getDate()}–${endLabel}`
      : `${start.getDate()} ${MONTHS[start.getMonth()]}–${endLabel}`;
  }

  protected async cancel(booking: Booking): Promise<void> {
    const sure = await this.dialogs.confirm('¿Cancelar esta reserva?', {
      message: `${booking.stayName}, ${this.dateRange(booking)}.`,
      confirm: 'Cancelar reserva',
      cancel: 'Mantener',
      destructive: true,
    });
    if (sure) this.bookings.cancel(booking.id);
  }
}
