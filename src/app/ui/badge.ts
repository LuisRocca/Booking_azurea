import { Component, input } from '@angular/core';
import { Text, View } from '@ng-native/components';

/**
 * A short status or highlight. A status carries a dot and a word, never color alone, so
 * "Confirmada" still reads for someone who cannot tell the green from the amber.
 */
@Component({
  selector: 'app-badge',
  imports: [Text, View],
  template: `
    <view class="badge" [attr.data-tone]="tone()">
      @if (tone() === 'success' || tone() === 'warning') {
        <view class="dot"></view>
      }
      <text class="label">{{ label() }}</text>
    </view>
  `,
  styles: `
    :host {
      align-self: flex-start;
    }
    .badge {
      flex-direction: row;
      align-items: center;
      gap: 6px;
      min-height: 24px;
      padding: 0 10px;
      border-radius: var(--radius-pill);
      background-color: var(--royal-soft);
    }
    .badge[data-tone='glass'],
    .badge[data-tone='success'],
    .badge[data-tone='warning'] {
      border-width: 1px;
      border-color: var(--glass-border);
      background-color: var(--glass-strong);
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 3px;
      background-color: var(--success);
    }
    .badge[data-tone='warning'] .dot {
      background-color: var(--warning);
    }
    .label {
      color: var(--royal-strong);
      font-size: 12px;
      font-weight: 700;
    }
    .badge[data-tone='glass'] .label {
      color: var(--ink);
    }
    .badge[data-tone='success'] .label {
      color: var(--success);
    }
    .badge[data-tone='warning'] .label {
      color: var(--warning);
    }
  `,
})
export class Badge {
  readonly label = input.required<string>();
  readonly tone = input<'royal' | 'glass' | 'success' | 'warning'>('royal');
}
