import { withInterceptors } from '@angular/common/http';
import { withComponentInputBinding } from '@angular/router';
import { provideNativeHttpClient } from '@ng-native/platform/http';
import {
  provideNativeRouter,
  withHeaderDefaults,
  withTabDefaults,
  type TabAppearance,
} from '@ng-native/router';
import type { Scheme } from '@ng-native/device';
import { routes } from './app.routes.ts';
import { mockApiInterceptor } from './core/mock-api/mock-api.interceptor.ts';

/**
 * Azurea colors for the native bars. A header or tab bar prop cannot read the CSS cascade, so the
 * tokens app.ts defines in CSS are repeated here, per color scheme.
 */
const bar = {
  light: { background: '#eef3ff', ink: '#0b1638', royal: '#2f5bea', royalSoft: '#dce6ff' },
  dark: { background: '#060b1e', ink: '#eef2ff', royal: '#7b9bff', royalSoft: '#1a2a5e' },
} as const;

/**
 * Bar props bypass the CSS engine's font matching, so they name a registered face directly:
 * `loadFonts()` registers each weight of a family as `<family>-<weight>`.
 * https://ng-native.com/packages/expo/fonts#matching-a-weight-and-a-style
 */
const FONT_SEMIBOLD = 'Plus Jakarta Sans-600';
const FONT_BOLD = 'Plus Jakarta Sans-700';

/** Android's packed ARGB integer, which a color prop needs when nothing processes it for us. */
function androidColor(hex: string): number {
  return parseInt(`ff${hex.slice(1)}`, 16) | 0;
}

/**
 * The tab bar's look. `tabBarBackgroundColor` and `stacked` are what iOS reads. Android reads its
 * label font and the active indicator (the pill behind the selected icon, lilac by default) at the
 * top level, keys `TabAppearance` does not type and the router passes through unprocessed.
 */
function tabAppearance(scheme: Scheme): TabAppearance {
  const ios: TabAppearance = {
    tabBarBackgroundColor: bar[scheme].background,
    stacked: {
      normal: { tabBarItemTitleFontFamily: FONT_SEMIBOLD },
      selected: { tabBarItemTitleFontFamily: FONT_SEMIBOLD },
    },
  };
  const android = {
    tabBarItemTitleFontFamily: FONT_SEMIBOLD,
    tabBarItemActiveIndicatorColor: androidColor(bar[scheme].royalSoft),
  };
  return { ...ios, ...android };
}

/**
 * Everything the app provides, in one list, so `main.ts` and the tests mount the same app.
 *
 * https://ng-native.com/packages/router#setting-it-up
 * https://ng-native.com/packages/platform#http-requests
 */
export const appProviders = [
  provideNativeRouter(
    routes,
    // A `:id` in the url arrives as the page's `id` input.
    withComponentInputBinding(),
    withHeaderDefaults((scheme) => ({
      backgroundColor: bar[scheme].background,
      titleColor: bar[scheme].ink,
      largeTitleColor: bar[scheme].ink,
      color: bar[scheme].royal,
      titleFontFamily: FONT_BOLD,
      largeTitleFontFamily: FONT_BOLD,
      backTitleFontFamily: FONT_SEMIBOLD,
      userInterfaceStyle: scheme,
      hideShadow: true,
    })),
    withTabDefaults((scheme) => ({
      tintColor: bar[scheme].royal,
      backgroundColor: bar[scheme].background,
      standardAppearance: tabAppearance(scheme),
    })),
  ),
  // Never plain `provideHttpClient()`: on a device every body would arrive as null.
  provideNativeHttpClient(withInterceptors([mockApiInterceptor])),
];
