import { Component, input, output } from '@angular/core';
import { Text, View } from '@ng-native/components';

/** A section title with an optional link on the right ("Ver todo"). */
@Component({
  selector: 'app-section-header',
  imports: [Text, View],
  template: `
    <view class="row">
      <text class="title" accessibilityRole="header">{{ title() }}</text>
      @if (action(); as action) {
        <text pressable accessibilityRole="link" class="action" (press)="actionPress.emit()">{{ action }}</text>
      }
    </view>
  `,
  styles: `
    .row {
      flex-direction: row;
      align-items: baseline;
      justify-content: space-between;
      margin: var(--space-6) 0 var(--space-3);
    }
    .title {
      color: var(--ink);
      font-size: 17px;
      line-height: 22px;
      font-weight: 700;
      letter-spacing: -0.2px;
    }
    .action {
      color: var(--royal-strong);
      font-size: 14px;
      font-weight: 600;
    }
  `,
})
export class SectionHeader {
  readonly title = input.required<string>();
  readonly action = input<string>();
  readonly actionPress = output<void>();
}
