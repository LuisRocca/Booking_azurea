import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, resource, signal } from '@angular/core';
import {
  FormField,
  email,
  form,
  max,
  min,
  required,
  submit,
} from '@angular/forms/signals';
import {
  KeyboardAvoidingView,
  Pressable,
  SafeAreaProvider,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { BREAKFAST_PER_GUEST_NIGHT, bookingTotal, isoDate } from '../../core/booking-rules.ts';
import { BookingsService } from '../../core/bookings.service.ts';
import type { ApiError } from '../../core/models.ts';
import { StaysService } from '../../core/stays.service.ts';
import { Aura } from '../../ui/aura.ts';
import { Button } from '../../ui/button.ts';
import { Icon } from '../../ui/icon.ts';

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MAX_NIGHTS = 14;

/** The next week, starting tomorrow, as the check-in choices. */
function nextDays(): { iso: string; weekday: string; day: number }[] {
  return Array.from({ length: 7 }, (_, index) => {
    const iso = isoDate(index + 1);
    const date = new Date(`${iso}T12:00:00`);
    return { iso, weekday: WEEKDAYS[date.getDay()], day: date.getDate() };
  });
}

/**
 * The booking form, presented as a modal. A presented screen has no header and no automatic
 * insets, so it brings its own close button and `<safe-area-view>`.
 *
 * The form is Signal Forms: `data` is the model, `f` its field tree, `[formField]` binds a native
 * control to a field, and `submit()` only runs the action for a valid form. An error the API sends
 * back is returned from the action with the field it belongs to, so it shows like any other.
 *
 * https://ng-native.com/guide/forms
 * https://ng-native.com/packages/router/screens#presented-screens-have-no-header
 * https://ng-native.com/packages/components/keyboard-avoiding-view
 */
@Component({
  selector: 'app-booking',
  imports: [
    Aura,
    Button,
    CurrencyPipe,
    FormField,
    Icon,
    KeyboardAvoidingView,
    Pressable,
    SafeAreaProvider,
    SafeAreaView,
    ScrollView,
    Switch,
    Text,
    TextInput,
    View,
  ],
  template: `
    <app-aura />
    <safe-area-provider [reportInsets]="false" class="fill">
      <safe-area-view class="fill" [edges]="['top', 'bottom']">
        <view class="top-bar">
          <pressable accessibilityRole="button" accessibilityLabel="Cerrar" (press)="nav.back()">
            <text class="link">Cerrar</text>
          </pressable>
          <text class="top-title" accessibilityRole="header">Reservar</text>
          <view class="top-spacer"></view>
        </view>

        <keyboard-avoiding-view class="fill">
          <scroll-view class="fill" keyboardShouldPersistTaps="handled">
            <view class="body">
              <text class="stay-name">{{ stay.value()?.name }}</text>

              <text class="label" accessibilityRole="header">Llegada</text>
              <view class="days">
                @for (day of days; track day.iso) {
                  <pressable
                    accessibilityRole="radio"
                    [accessibilityLabel]="day.weekday + ' ' + day.day"
                    [accessibilityState]="{ checked: data().checkIn === day.iso }"
                    class="day"
                    [attr.data-selected]="data().checkIn === day.iso ? '' : null"
                    (press)="pickDay(day.iso)"
                  >
                    <text class="day-weekday">{{ day.weekday }}</text>
                    <text class="day-number">{{ day.day }}</text>
                  </pressable>
                }
              </view>
              @if (f.checkIn().touched() && f.checkIn().invalid()) {
                <text class="error" accessibilityRole="alert">{{ f.checkIn().errors()[0].message }}</text>
              }

              <view class="stepper-row">
                <text class="label">Noches</text>
                <view class="stepper">
                  <pressable
                    accessibilityRole="button"
                    accessibilityLabel="Una noche menos"
                    [disabled]="data().nights <= 1"
                    [style.opacity]="data().nights <= 1 ? 0.35 : 1"
                    class="step"
                    (press)="changeNights(-1)"
                  >
                    <app-icon name="minus" tone="royal-strong" [size]="20" />
                  </pressable>
                  <text class="step-value">{{ data().nights }}</text>
                  <pressable
                    accessibilityRole="button"
                    accessibilityLabel="Una noche más"
                    [disabled]="data().nights >= maxNights"
                    [style.opacity]="data().nights >= maxNights ? 0.35 : 1"
                    class="step"
                    (press)="changeNights(1)"
                  >
                    <app-icon name="plus" tone="royal-strong" [size]="20" />
                  </pressable>
                </view>
              </view>

              <view class="stepper-row">
                <text class="label">Huéspedes</text>
                <view class="stepper">
                  <pressable
                    accessibilityRole="button"
                    accessibilityLabel="Un huésped menos"
                    [disabled]="data().guests <= 1"
                    [style.opacity]="data().guests <= 1 ? 0.35 : 1"
                    class="step"
                    (press)="changeGuests(-1)"
                  >
                    <app-icon name="minus" tone="royal-strong" [size]="20" />
                  </pressable>
                  <text class="step-value">{{ data().guests }}</text>
                  <pressable
                    accessibilityRole="button"
                    accessibilityLabel="Un huésped más"
                    [disabled]="data().guests >= maxGuests()"
                    [style.opacity]="data().guests >= maxGuests() ? 0.35 : 1"
                    class="step"
                    (press)="changeGuests(1)"
                  >
                    <app-icon name="plus" tone="royal-strong" [size]="20" />
                  </pressable>
                </view>
              </view>
              @if (f.guests().invalid()) {
                <text class="error" accessibilityRole="alert">{{ f.guests().errors()[0].message }}</text>
              }

              <text class="label">Nombre</text>
              <text-input
                accessibilityLabel="Nombre"
                placeholder="Como aparece en tu documento"
                autoCapitalize="words"
                textContentType="name"
                [formField]="f.guestName"
              />
              @if (f.guestName().touched() && f.guestName().invalid()) {
                <text class="error" accessibilityRole="alert">{{ f.guestName().errors()[0].message }}</text>
              }

              <text class="label">Email</text>
              <text-input
                accessibilityLabel="Email"
                placeholder="tu@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                [autoCorrect]="false"
                textContentType="emailAddress"
                [formField]="f.email"
              />
              @if (f.email().touched() && f.email().invalid()) {
                <text class="error" accessibilityRole="alert">{{ f.email().errors()[0].message }}</text>
              }

              <view class="switch-row">
                <view class="fill">
                  <text class="label">Desayuno</text>
                  <text class="muted">{{ breakfastPrice | currency: 'USD' : 'symbol' : '1.0-0' }} por huésped y noche</text>
                </view>
                <switch accessibilityLabel="Desayuno" [formField]="f.breakfast" />
              </view>

              @if (status() === 'error') {
                <text class="error" accessibilityRole="alert">
                  No pudimos confirmar la reserva. Inténtalo de nuevo.
                </text>
              }
            </view>
          </scroll-view>

          <view class="footer">
            <view>
              <text class="total">{{ total() | currency: 'USD' : 'symbol' : '1.0-0' }}</text>
              <text class="muted">{{ summary() }}</text>
            </view>
            <app-button
              [label]="f().submitting() ? 'Confirmando…' : 'Confirmar'"
              [disabled]="f().submitting()"
              (press)="confirm()"
            />
          </view>
        </keyboard-avoiding-view>
      </safe-area-view>
    </safe-area-provider>
  `,
  styles: `
    /* A presented screen: Aura behind the form too, never a flat white sheet. */
    :host {
      flex: 1;
      background-color: var(--bg);
    }
    .fill {
      flex: 1;
    }
    .top-bar {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-5);
    }
    .top-title {
      color: var(--ink);
      font-size: 17px;
      font-weight: 600;
    }
    .top-spacer {
      width: 64px;
    }
    .link {
      width: 64px;
      color: var(--royal-strong);
      font-size: 15px;
      font-weight: 600;
    }
    .body {
      gap: var(--space-2);
      padding: var(--space-2) var(--space-5) var(--space-6);
    }
    .stay-name {
      color: var(--ink);
      font-size: 22px;
      line-height: 28px;
      font-weight: 700;
      letter-spacing: -0.2px;
    }
    .label {
      margin-top: var(--space-4);
      color: var(--ink);
      font-size: 17px;
      line-height: 22px;
      font-weight: 600;
    }
    .muted {
      color: var(--ink-muted);
      font-size: 12px;
      line-height: 16px;
      font-weight: 500;
    }
    .days {
      flex-direction: row;
      gap: 6px;
    }
    .day {
      flex: 1;
      align-items: center;
      padding: var(--space-2) 0;
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: var(--radius-md);
      background-color: var(--glass);
      transform: translateY(0px);
      transition:
        background-color 280ms cubic-bezier(0.22, 1, 0.36, 1),
        border-color 280ms cubic-bezier(0.22, 1, 0.36, 1),
        transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    /* The chosen day turns royal and lifts 2pt, easing into place. */
    .day[data-selected] {
      border-color: var(--royal);
      background-color: var(--royal);
      box-shadow: var(--shadow-royal);
      transform: translateY(-2px);
    }
    .day-weekday {
      color: var(--ink-subtle);
      font-size: 12px;
      font-weight: 500;
    }
    .day-number {
      color: var(--ink);
      font-size: 17px;
      font-weight: 700;
    }
    .day[data-selected] .day-weekday,
    .day[data-selected] .day-number {
      color: var(--on-royal);
    }
    .stepper-row,
    .switch-row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .stepper {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      margin-top: var(--space-4);
    }
    .step {
      width: 44px;
      height: 44px;
      align-items: center;
      justify-content: center;
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: var(--radius-pill);
      background-color: var(--glass);
    }
    .step-value {
      min-width: 24px;
      color: var(--ink);
      font-size: 17px;
      font-weight: 700;
      font-variant: tabular-nums;
      text-align: center;
    }
    text-input {
      min-height: 48px;
      padding: 0 var(--space-4);
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: var(--radius-md);
      background-color: var(--glass);
      color: var(--ink);
      font-size: 15px;
    }
    text-input[data-invalid][data-touched] {
      border-color: var(--danger);
    }
    .error {
      color: var(--danger);
      font-size: 12px;
      line-height: 16px;
      font-weight: 600;
    }
    /* The Dock: dense glass with the total and the one primary action. */
    .footer {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-5);
      border-top-width: 1px;
      border-color: var(--glass-border);
      border-top-left-radius: var(--radius-xl);
      border-top-right-radius: var(--radius-xl);
      background-color: var(--glass-strong);
      box-shadow: var(--shadow-float);
    }
    .total {
      color: var(--ink);
      font-size: 20px;
      line-height: 24px;
      font-weight: 800;
    }
  `,
})
export class BookingPage {
  private readonly stays = inject(StaysService);
  private readonly bookings = inject(BookingsService);
  protected readonly nav = inject(NativeNavigation);

  readonly stayId = input.required<string>();

  protected readonly days = nextDays();
  protected readonly maxNights = MAX_NIGHTS;
  protected readonly breakfastPrice = BREAKFAST_PER_GUEST_NIGHT;
  protected readonly stay = resource({
    params: () => ({ id: this.stayId() }),
    loader: ({ params }) => this.stays.get(params.id),
  });
  protected readonly maxGuests = computed(() => this.stay.value()?.maxGuests ?? 1);

  protected readonly status = signal<'idle' | 'error'>('idle');
  protected readonly data = signal({
    checkIn: '',
    nights: 2,
    guests: 1,
    guestName: '',
    email: '',
    breakfast: false,
  });
  protected readonly f = form(this.data, (path) => {
    required(path.checkIn, { message: 'Elige el día de llegada.' });
    min(path.nights, 1);
    max(path.nights, MAX_NIGHTS);
    min(path.guests, 1);
    max(path.guests, () => this.maxGuests(), { message: 'Hay más huéspedes de los permitidos.' });
    required(path.guestName, { message: 'Escribe tu nombre.' });
    required(path.email, { message: 'Escribe tu email.' });
    email(path.email, { message: 'Ese email no parece válido.' });
  });

  protected readonly summary = computed(() => {
    const { nights, guests } = this.data();
    return `${nights} ${nights === 1 ? 'noche' : 'noches'} · ${guests} ${guests === 1 ? 'huésped' : 'huéspedes'}`;
  });

  protected readonly total = computed(() => {
    const stay = this.stay.value();
    return stay ? bookingTotal(stay, this.data()) : 0;
  });

  protected pickDay(iso: string): void {
    this.f.checkIn().value.set(iso);
    this.f.checkIn().markAsTouched();
  }

  protected changeNights(delta: number): void {
    this.f.nights().value.update((nights) => nights + delta);
  }

  protected changeGuests(delta: number): void {
    this.f.guests().value.update((guests) => guests + delta);
  }

  protected async confirm(): Promise<void> {
    this.status.set('idle');
    await submit(this.f, {
      action: async () => {
        try {
          const booking = await this.bookings.create({ stayId: this.stayId(), ...this.data() });
          // The form gives way to its reward: the confirmation takes this modal's place.
          await this.nav.replace(['/confirmation', booking.id]);
          return;
        } catch (error) {
          const apiError = error instanceof HttpErrorResponse ? (error.error as ApiError) : null;
          if (apiError?.field) {
            return { kind: 'api', message: apiError.message, fieldTree: this.f[apiError.field] };
          }
          this.status.set('error');
          return;
        }
      },
    });
  }
}
