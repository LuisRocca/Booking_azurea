import { Component, input, model } from '@angular/core';
import { Pressable, ScrollView, Text, View } from '@ng-native/components';
import { Icon, type IconName } from './icon.ts';

/**
 * A row of single-choice glass chips that scrolls sideways: categories on Home and Explore.
 * `value` is a two-way `model()`, so a page writes `[(value)]="category"`. The chosen chip turns
 * royal; its colors ease over, since a transition interpolates colors channel by channel.
 * `icons` optionally puts an icon before an option's label.
 *
 * https://ng-native.com/packages/components/scroll-view
 * https://angular.dev/guide/components/inputs#model-inputs
 */
@Component({
  selector: 'app-chips',
  imports: [Icon, Pressable, ScrollView, Text, View],
  template: `
    <scroll-view [horizontal]="true" [showsHorizontalScrollIndicator]="false" class="scroller">
      <view class="row" accessibilityRole="radiogroup">
        @for (option of options(); track option) {
          <pressable
            #chip="pressable"
            accessibilityRole="radio"
            [accessibilityState]="{ checked: value() === option }"
            class="chip"
            [attr.data-selected]="value() === option ? '' : null"
            [attr.data-pressed]="chip.pressed() ? '' : null"
            (press)="value.set(option)"
          >
            @if (icons()[option]; as icon) {
              <app-icon [name]="icon" [tone]="value() === option ? 'on-royal' : 'muted'" [size]="18" />
            }
            <text class="label">{{ option }}</text>
          </pressable>
        }
      </view>
    </scroll-view>
  `,
  styles: `
    .scroller {
      flex-grow: 0;
      margin: 0 calc(var(--space-5) * -1);
    }
    .row {
      flex-direction: row;
      gap: var(--space-2);
      padding: 2px var(--space-5) var(--space-2);
    }
    .chip {
      min-height: 38px;
      flex-direction: row;
      align-items: center;
      gap: 6px;
      padding: 0 var(--space-4);
      border-width: 1px;
      border-color: var(--glass-border);
      border-radius: var(--radius-pill);
      background-color: var(--glass);
      transform: scale(1);
      transition:
        background-color 280ms cubic-bezier(0.22, 1, 0.36, 1),
        border-color 280ms cubic-bezier(0.22, 1, 0.36, 1),
        transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .chip[data-pressed] {
      transform: scale(0.96);
    }
    .chip[data-selected] {
      border-color: var(--royal);
      background-color: var(--royal);
      box-shadow: var(--shadow-royal);
    }
    .label {
      color: var(--ink-muted);
      font-size: 14px;
      font-weight: 600;
    }
    .chip[data-selected] .label {
      color: var(--on-royal);
    }
  `,
})
export class Chips {
  readonly options = input.required<readonly string[]>();
  readonly value = model.required<string>();
  readonly icons = input<Partial<Record<string, IconName>>>({});
}
