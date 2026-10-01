import { Component, computed, effect, inject } from '@angular/core';
import { NativeHeader, NativeNavigation, NativeTab, NativeTabsOutlet } from '@ng-native/router';
import { BookingsService } from '../../core/bookings.service.ts';
import { OnboardingService } from '../../core/onboarding.service.ts';
import { ICONS } from '../../ui/icon.ts';

/**
 * A real tab bar. Tabs are declared as content, so a badge is just a signal. Each icon is an
 * Azurea PNG given as a `template`: native draws it as a mask and tints it with the bar's color,
 * on iOS and Android alike.
 *
 * The root stack's header is hidden: each tab's own stack draws its header.
 *
 * The first time the app opens, Welcome is presented full screen over the tabs. The effect waits
 * for the stored flag to be read back (see OnboardingService) and presents at most once.
 *
 * https://ng-native.com/packages/router/tabs
 * https://ng-native.com/packages/router/screens
 */
@Component({
  selector: 'app-tabs',
  imports: [NativeHeader, NativeTab, NativeTabsOutlet],
  template: `
    <native-header [hidden]="true" />
    <native-tabs-outlet>
      <native-tab path="home" title="Inicio" [icon]="icons.home" />
      <native-tab path="explore" title="Explorar" [icon]="icons.explore" />
      <native-tab path="bookings" title="Mis reservas" [icon]="icons.bookings" [badge]="badge()" />
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
  private readonly onboarding = inject(OnboardingService);
  private readonly nav = inject(NativeNavigation);
  private welcomed = false;

  protected readonly icons = {
    home: { template: ICONS.home },
    explore: { template: ICONS.search },
    bookings: { template: ICONS.suitcase },
  };

  protected readonly badge = computed(() => {
    const count = this.bookings.count();
    return count > 0 ? String(count) : undefined;
  });

  constructor() {
    effect(() => {
      if (!this.onboarding.shouldWelcome() || this.welcomed) return;
      this.welcomed = true;
      void this.nav.present(['/welcome'], { as: 'fullScreenModal' });
    });
  }
}
