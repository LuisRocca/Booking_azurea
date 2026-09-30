import { withInterceptors } from '@angular/common/http';
import { withComponentInputBinding } from '@angular/router';
import { provideNativeHttpClient } from '@ng-native/platform/http';
import { provideNativeRouter, withHeaderDefaults, withTabDefaults } from '@ng-native/router';
import { routes } from './app.routes.ts';
import { mockApiInterceptor } from './core/mock-api/mock-api.interceptor.ts';

/**
 * Azurea colors for the native bars. A header or tab bar prop cannot read the CSS cascade, so the
 * tokens app.ts defines in CSS are repeated here, per color scheme.
 */
const bar = {
  light: { background: '#eef3ff', ink: '#0b1638', royal: '#2f5bea' },
  dark: { background: '#060b1e', ink: '#eef2ff', royal: '#7b9bff' },
} as const;

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
      userInterfaceStyle: scheme,
      hideShadow: true,
    })),
    withTabDefaults((scheme) => ({
      tintColor: bar[scheme].royal,
      backgroundColor: bar[scheme].background,
    })),
  ),
  // Never plain `provideHttpClient()`: on a device every body would arrive as null.
  provideNativeHttpClient(withInterceptors([mockApiInterceptor])),
];
