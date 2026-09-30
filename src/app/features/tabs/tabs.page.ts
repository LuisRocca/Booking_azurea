import { Component, computed, inject } from '@angular/core';
import { NativeHeader, NativeTab, NativeTabsOutlet } from '@ng-native/router';
import { BookingsService } from '../../core/bookings.service.ts';

/**
 * A real tab bar. Tabs are declared as content, so a badge is just a signal.
 * The root stack's header is hidden: each tab's own stack draws its header.
 *
 * https://ng-native.com/packages/router/tabs
 */
@Component({
  selector: 'app-tabs',
  imports: [NativeHeader, NativeTab, NativeTabsOutlet],
  template: `
    <native-header [hidden]="true" />
    <native-tabs-outlet>
      <native-tab path="explore" title="Explorar" sfSymbol="magnifyingglass" />
      <native-tab path="bookings" title="Mis reservas" sfSymbol="suitcase.fill" [badge]="badge()" />
    </native-tabs-outlet>
  `,
  styles: `
    :host {
      flex: 1;
    }
  `,
})
export class TabsPage {
  private readonly bookings = inject(BookingsService);
  protected readonly badge = computed(() => {
    const count = this.bookings.count();
    return count > 0 ? String(count) : undefined;
  });
}
