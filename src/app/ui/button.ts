import { Component, input, output } from '@angular/core';
import { Pressable, Text } from '@ng-native/components';

/**
 * Azurea's pill button. `primary` is the one call to action of a screen; `glass` sits on Aura or a
 * photo; `ghost` is the way out. A press shrinks it to 97% and eases back: `transition` on the
 * pressed attribute, since `:hover` and `:focus-visible` do not exist on native.
 *
 * https://ng-native.com/packages/components/pressable
 * https://ng-native.com/packages/fabric/animation
 */
@Component({
  selector: 'app-button',
  imports: [Pressable, Text],
  template: `
    <pressable
      #button="pressable"
      accessibilityRole="button"
      [accessibilityLabel]="accessibilityLabel() ?? label()"
      [accessibilityState]="{ disabled: disabled() }"
      [disabled]="disabled()"
      class="button"
      [attr.data-variant]="variant()"
      [attr.data-size]="size()"
      [attr.data-pressed]="button.pressed() ? '' : null"
      [attr.data-disabled]="disabled() ? '' : null"
      (press)="press.emit()"
    >
      <text class="label">{{ label() }}</text>
    </pressable>
  `,
  styles: `
    .button {
      min-height: 48px;
      align-items: center;
      justify-content: center;
      padding: 0 var(--space-6);
      border-radius: var(--radius-pill);
      transform: scale(1);
      opacity: 1;
      transition:
        transform 160ms cubic-bezier(0.22, 1, 0.36, 1),
        opacity 160ms ease-out;
    }
    .button[data-size='lg'] {
      min-height: 56px;
      padding: 0 var(--space-8);
    }
    .button[data-pressed] {
      transform: scale(0.97);
    }
    .button[data-disabled] {
      opacity: 0.6;
    }
    .button[data-variant='primary'] {
      background-color: var(--royal);
      box-shadow: var(--shadow-royal);
    }
    .button[data-variant='glass'] {
      border-width: 1px;
      border-color: var(--glass-border);
      background-color: var(--glass-strong);
      box-shadow: var(--shadow-glass);
    }
    .label {
      color: var(--royal-strong);
      font-size: 15px;
      font-weight: 700;
    }
    .button[data-size='lg'] .label {
      font-size: 16px;
    }
    .button[data-variant='primary'] .label {
      color: var(--on-royal);
    }
    .button[data-variant='glass'] .label {
      color: var(--ink);
    }
  `,
})
export class Button {
  readonly label = input.required<string>();
  readonly variant = input<'primary' | 'glass' | 'ghost'>('primary');
  readonly size = input<'md' | 'lg'>('md');
  readonly disabled = input(false);
  /** When the visible label is not the whole story, e.g. "Cancelar reserva en Casa Laguna". */
  readonly accessibilityLabel = input<string>();
  readonly press = output<void>();
}
