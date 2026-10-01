import { Component, input } from '@angular/core';
import { View } from '@ng-native/components';

/**
 * Aura: the soft blue light behind a screen, which the glass sits on. Native has no
 * `backdrop-filter` and no `filter: blur()` on iOS, so the blur is baked into the blobs
 * themselves: radial gradients that fade to transparent.
 *
 * With `animated`, the blobs drift in slow `@keyframes` loops. Only `transform` moves, which is
 * what native animates best, and only on screens that hold still (Welcome, Confirmation): the
 * engine steps keyframes on `requestAnimationFrame`, so an endless loop behind a long scrolling
 * list is work for nothing. `prefers-reduced-motion` stops it.
 *
 * Place it first inside a `:host` with `position: relative` (the default) and it fills it.
 *
 * https://ng-native.com/packages/fabric/animation
 * https://ng-native.com/packages/fabric/supported-css
 */
@Component({
  selector: 'app-aura',
  imports: [View],
  template: `
    <view class="layer" pointerEvents="none" importantForAccessibility="no-hide-descendants">
      <view class="blob one" [attr.data-animated]="animated() ? '' : null"></view>
      <view class="blob two" [attr.data-animated]="animated() ? '' : null"></view>
      <view class="blob three" [attr.data-animated]="animated() ? '' : null"></view>
    </view>
  `,
  styles: `
    :host {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
    .layer {
      flex: 1;
      overflow: hidden;
      background-color: var(--bg);
    }
    .blob {
      position: absolute;
      border-radius: 999px;
    }
    .one {
      top: -140px;
      left: -150px;
      width: 420px;
      height: 420px;
      background-image: radial-gradient(circle, color-mix(in srgb, var(--royal) 45%, transparent), transparent 70%);
    }
    .two {
      top: 200px;
      right: -190px;
      width: 400px;
      height: 400px;
      background-image: radial-gradient(circle, color-mix(in srgb, var(--sky) 55%, transparent), transparent 70%);
    }
    .three {
      bottom: -140px;
      left: -80px;
      width: 380px;
      height: 380px;
      background-image: radial-gradient(circle, var(--ice), transparent 70%);
    }
    .one[data-animated] {
      animation: aura-drift-one 16s ease-in-out infinite alternate;
    }
    .two[data-animated] {
      animation: aura-drift-two 19s ease-in-out infinite alternate;
    }
    .three[data-animated] {
      animation: aura-drift-three 22s ease-in-out infinite alternate;
    }
    @keyframes aura-drift-one {
      from {
        transform: translateX(0px) translateY(0px) scale(1);
      }
      to {
        transform: translateX(40px) translateY(30px) scale(1.12);
      }
    }
    @keyframes aura-drift-two {
      from {
        transform: translateX(0px) translateY(0px) scale(1.05);
      }
      to {
        transform: translateX(-36px) translateY(-24px) scale(0.95);
      }
    }
    @keyframes aura-drift-three {
      from {
        transform: translateX(0px) translateY(0px);
      }
      to {
        transform: translateX(24px) translateY(-40px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .blob {
        animation-name: none;
      }
    }
  `,
})
export class Aura {
  readonly animated = input(false);
}
