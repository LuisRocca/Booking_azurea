import { Component, inject } from '@angular/core';
import { SafeAreaProvider, SafeAreaView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { OnboardingService } from '../../core/onboarding.service.ts';
import { Aura } from '../../ui/aura.ts';
import { Button } from '../../ui/button.ts';

/**
 * Shown once, the first time the app opens, presented full screen over the tabs by `TabsPage`.
 * A presented screen has no header and no automatic insets, so it brings its own
 * `<safe-area-view>`; `fullScreenModal` cannot be dragged away, so "Comenzar" is the way out.
 *
 * Motion: the Aura drifts, two glass tiles float out of step, and the card rises in last.
 *
 * https://ng-native.com/packages/router/screens#presented-screens-have-no-header
 * https://ng-native.com/packages/fabric/animation
 */
@Component({
  selector: 'app-welcome',
  imports: [Aura, Button, SafeAreaProvider, SafeAreaView, Text, View],
  template: `
    <app-aura [animated]="true" />
    <safe-area-provider [reportInsets]="false" class="fill">
      <safe-area-view class="fill" [edges]="['top', 'bottom']">
        <view class="stage" importantForAccessibility="no-hide-descendants">
          <view class="tile tile-one float"></view>
          <view class="tile tile-two float late"></view>
          <view class="pill float later">
            <view class="pill-check"><text class="pill-check-mark">✓</text></view>
            <view>
              <text class="pill-title">Reserva confirmada</text>
              <text class="caption">3 noches · 2 huéspedes</text>
            </view>
          </view>
        </view>

        <view class="card rise">
          <text class="overline">Azurea</text>
          <text class="display" accessibilityRole="header">Reserva lugares que se sienten bien.</text>
          <text class="body">Estancias elegidas a mano, con confirmación al instante.</text>
          <app-button class="start" label="Comenzar" size="lg" (press)="start()" />
        </view>
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
    .stage {
      flex: 1;
    }
    .tile {
      position: absolute;
      border-width: 8px;
      border-color: var(--glass-strong);
      border-radius: 28px;
      box-shadow: var(--shadow-float);
    }
    .tile-one {
      top: 48px;
      left: 32px;
      width: 176px;
      height: 164px;
      background-image: linear-gradient(180deg, var(--sky), var(--royal) 70%, var(--deep));
      rotate: -6deg;
    }
    .tile-two {
      top: 120px;
      right: 28px;
      width: 152px;
      height: 184px;
      background-image: linear-gradient(180deg, var(--ice), var(--sky) 60%, var(--royal));
      rotate: 5deg;
    }
    .pill {
      position: absolute;
      top: 280px;
      left: 64px;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      padding: 10px 16px 10px 10px;
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: var(--radius-pill);
      background-color: var(--glass-strong);
      box-shadow: var(--shadow-float);
    }
    .pill-check {
      width: 32px;
      height: 32px;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      background-color: var(--royal);
    }
    .pill-check-mark {
      color: var(--on-royal);
      font-size: 16px;
      font-weight: 800;
    }
    .pill-title {
      color: var(--ink);
      font-size: 13px;
      font-weight: 700;
    }
    .caption {
      color: var(--ink-subtle);
      font-size: 12px;
      font-weight: 500;
    }
    .card {
      gap: var(--space-2);
      margin: 0 var(--space-4) var(--space-4);
      padding: var(--space-6);
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: var(--radius-xl);
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
    .display {
      color: var(--ink);
      font-size: 34px;
      line-height: 40px;
      font-weight: 800;
      letter-spacing: -0.7px;
    }
    .body {
      color: var(--ink-muted);
      font-size: 15px;
      line-height: 22px;
      font-weight: 500;
    }
    .start {
      margin-top: var(--space-4);
    }
    .float {
      animation: welcome-float 6s ease-in-out infinite;
    }
    .late {
      animation-delay: 1200ms;
    }
    .later {
      animation-delay: 2100ms;
    }
    .rise {
      animation: welcome-rise 640ms cubic-bezier(0.22, 1, 0.36, 1) 150ms both;
    }
    @keyframes welcome-float {
      0% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
      100% {
        transform: translateY(0px);
      }
    }
    @keyframes welcome-rise {
      from {
        opacity: 0;
        transform: translateY(24px);
      }
      to {
        opacity: 1;
        transform: translateY(0px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .float,
      .rise {
        animation-name: none;
      }
    }
  `,
})
export class WelcomePage {
  private readonly onboarding = inject(OnboardingService);
  private readonly nav = inject(NativeNavigation);

  protected start(): void {
    this.onboarding.finish();
    this.nav.back();
  }
}
