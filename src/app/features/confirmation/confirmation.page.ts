import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { SafeAreaProvider, SafeAreaView, ScrollView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { BookingsService } from '../../core/bookings.service.ts';
import { localDate, shortDate } from '../../core/dates.ts';
import { Aura } from '../../ui/aura.ts';
import { Button } from '../../ui/button.ts';

/**
 * The reward after booking, presented as a modal by the booking form in place of itself. The
 * booking is read back from `BookingsService` by the `:bookingId` in the url, so the screen
 * survives a reload of its route and never needs the form's state.
 *
 * Motion: the check pops in with a slight overshoot, a ring pulses out of it, then the ticket
 * and the buttons rise in turn.
 *
 * https://ng-native.com/packages/router/screens#presented-screens-have-no-header
 * https://ng-native.com/packages/fabric/animation
 */
@Component({
  selector: 'app-confirmation',
  imports: [Aura, Button, CurrencyPipe, SafeAreaProvider, SafeAreaView, ScrollView, Text, View],
  template: `
    <app-aura [animated]="true" />
    <safe-area-provider [reportInsets]="false" class="fill">
      <safe-area-view class="fill" [edges]="['top', 'bottom']">
        <scroll-view class="fill" [contentContainerStyle]="{ flexGrow: 1 }">
          <view class="content">
            <view class="check" importantForAccessibility="no-hide-descendants">
              <view class="ring"></view>
              <view class="core"><text class="mark">✓</text></view>
            </view>

            <view class="headline rise d1">
              <text class="display" accessibilityRole="header">¡Reserva confirmada!</text>
              <text class="body">Te esperamos. La encontrarás siempre en Mis reservas.</text>
            </view>

            @if (booking(); as booking) {
              <view class="ticket rise d2">
                <text class="overline">Reserva {{ code() }}</text>
                <text class="stay">{{ booking.stayName }}</text>
                <text class="caption">{{ booking.city }}</text>
                <view class="cut"></view>
                <view class="facts">
                  <view class="fact">
                    <text class="caption">Llegada</text>
                    <text class="fact-value">{{ checkIn() }}</text>
                  </view>
                  <view class="fact">
                    <text class="caption">Salida</text>
                    <text class="fact-value">{{ checkOut() }}</text>
                  </view>
                  <view class="fact">
                    <text class="caption">Huéspedes</text>
                    <text class="fact-value">{{ booking.guests }}</text>
                  </view>
                </view>
                <view class="cut"></view>
                <view class="total-row">
                  <text class="total-label">Total</text>
                  <text class="total">{{ booking.total | currency: 'USD' : 'symbol' : '1.0-0' }}</text>
                </view>
              </view>
            }

            <view class="actions rise d3">
              <app-button label="Ver mis reservas" size="lg" (press)="openBookings()" />
              <app-button label="Listo" variant="ghost" (press)="nav.back()" />
            </view>
          </view>
        </scroll-view>
      </safe-area-view>
    </safe-area-provider>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .fill {
      flex: 1;
    }
    .content {
      flex-grow: 1;
      padding: var(--space-10) var(--space-5) var(--space-5);
    }
    .check {
      width: 112px;
      height: 112px;
      align-self: center;
    }
    .ring,
    .core {
      position: absolute;
      top: 0;
      left: 0;
      width: 112px;
      height: 112px;
      border-radius: 56px;
      background-color: var(--royal);
    }
    .ring {
      opacity: 0;
      animation: confirm-ring 2400ms cubic-bezier(0.22, 1, 0.36, 1) 600ms infinite;
    }
    .core {
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-royal);
      animation: confirm-pop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    .mark {
      color: var(--on-royal);
      font-size: 52px;
      line-height: 60px;
      font-weight: 800;
    }
    .headline {
      align-items: center;
      gap: var(--space-2);
      margin-top: var(--space-8);
    }
    .display {
      color: var(--ink);
      font-size: 30px;
      line-height: 36px;
      font-weight: 800;
      letter-spacing: -0.6px;
      text-align: center;
    }
    .body {
      color: var(--ink-muted);
      font-size: 15px;
      line-height: 22px;
      font-weight: 500;
      text-align: center;
    }
    .ticket {
      gap: 2px;
      margin-top: var(--space-8);
      padding: var(--space-4);
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: 28px;
      background-color: var(--glass-strong);
      box-shadow: var(--shadow-float);
    }
    .overline {
      color: var(--royal-strong);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.9px;
      text-transform: uppercase;
    }
    .stay {
      color: var(--ink);
      font-size: 17px;
      line-height: 22px;
      font-weight: 700;
    }
    .caption {
      color: var(--ink-subtle);
      font-size: 12px;
      line-height: 16px;
      font-weight: 500;
    }
    .cut {
      margin: var(--space-3) 0;
      border-top-width: 1.5px;
      border-style: dashed;
      border-color: var(--hairline);
    }
    .facts {
      flex-direction: row;
      gap: var(--space-2);
    }
    .fact {
      flex: 1;
      gap: 2px;
    }
    .fact-value {
      color: var(--ink);
      font-size: 14px;
      font-weight: 700;
    }
    .total-row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .total-label {
      color: var(--ink);
      font-size: 15px;
      font-weight: 600;
    }
    .total {
      color: var(--ink);
      font-size: 20px;
      line-height: 24px;
      font-weight: 800;
    }
    .actions {
      gap: var(--space-2);
      margin-top: auto;
      padding-top: var(--space-6);
    }
    .rise {
      animation: confirm-rise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .d1 {
      animation-delay: 280ms;
    }
    .d2 {
      animation-delay: 420ms;
    }
    .d3 {
      animation-delay: 560ms;
    }
    @keyframes confirm-pop {
      from {
        opacity: 0;
        transform: scale(0.6);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes confirm-ring {
      from {
        opacity: 0.5;
        transform: scale(0.8);
      }
      to {
        opacity: 0;
        transform: scale(1.7);
      }
    }
    @keyframes confirm-rise {
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
      .ring,
      .core,
      .rise {
        animation-name: none;
      }
    }
  `,
})
export class ConfirmationPage {
  private readonly bookings = inject(BookingsService);
  private readonly router = inject(Router);
  protected readonly nav = inject(NativeNavigation);

  readonly bookingId = input.required<string>();

  protected readonly booking = computed(() =>
    this.bookings.bookings().find((booking) => booking.id === this.bookingId()),
  );
  /** A short reference to read out at the front desk: "AZ-" and the id's first characters. */
  protected readonly code = computed(() => `AZ-${this.bookingId().slice(0, 6).toUpperCase()}`);
  protected readonly checkIn = computed(() => {
    const booking = this.booking();
    return booking ? shortDate(localDate(booking.checkIn)) : '';
  });
  protected readonly checkOut = computed(() => {
    const booking = this.booking();
    return booking ? shortDate(localDate(booking.checkIn, booking.nights)) : '';
  });

  /** Switches to the bookings tab; navigating out of the modal's url dismisses the modal. */
  protected openBookings(): void {
    void this.router.navigateByUrl('/bookings');
  }
}
