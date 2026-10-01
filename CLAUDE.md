# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Additions for Claude Code

AGENTS.md above is the framework reference (element names, styling, events, tests). This section
only adds what it does not say.

### Commands

- Package manager is **npm** (`package-lock.json` is committed); do not switch to pnpm.
- Single test file: `npx vitest run src/app/app.test.ts`; single test by name: `npx vitest run -t "counts taps"`.
- `npm run typecheck` runs `ngc` (not `tsc`) with `strictTemplates`, so it also type-checks templates.
- There is no lint script and no `web` target (`app.json` platforms are iOS and Android only).
- Expo Go is enough for development; a release build or a native module Expo Go lacks needs a
  development build (`npx expo run:ios` / `npx expo run:android`).

### How the app is wired

- `src/main.ts` registers the Expo runnable `main` and calls `mount(rootTag, App, fabricUIManager, options)`.
  Each option is load-bearing: `processColor` (colours), `conditions` (without it every `@media`
  query is false), `tokens` (hairline width), `resolveAssetSource` (without it images are blank).
  `watchConditions(app.engine)` is what makes rotation and `dark:` re-render. The providers
  (router, HTTP) live in `src/app/app.config.ts` as `appProviders`, shared by `main.ts` and the tests.
- Angular is compiled AOT by two parallel pipelines that must stay in sync:
  `metro.config.js` (`withAngularNative`) for the app, `vitest.config.mts` (`ngNative()` plugin) for tests.
  Component `styles` are compiled to a native style sheet at build time, not applied at runtime.
- Tests run in Node against a fake native layer; no simulator is needed. The fake does not enforce
  Android's native constraints, so native layout changes must also be checked on a device.
- Local imports use explicit `.ts` extensions (`import { App } from './app/app.ts'`,
  enabled by `allowImportingTsExtensions`); follow that.
- `app.json` sets `userInterfaceStyle: "automatic"` and `extra.router.root: "src/app"`.

### Booking app structure

- Educational template: each file's header comment links the ng-native.com page it follows. Keep
  that convention and prefer the docs' own patterns.
- No backend: `core/mock-api/mock-api.interceptor.ts` answers every `/api/...` request from
  `stays.data.ts` with simulated latency. Services (`core/*.service.ts`) use the real `HttpClient`
  and return Promises, which pages read with `resource({ loader })`.
- Bookings persist on the device through `Storage.signal('bookings', ...)` from `@ng-native/expo/store`.
- Navigation: root stack → `TabsPage` (native tabs: Inicio, Explorar, Mis reservas) → one
  `TabStack` per tab. Root routes presented over the tabs: `welcome` (full screen, once, from
  `TabsPage`), `book/:stayId` (modal) and `confirmation/:bookingId`, which replaces the form
  (`nav.replace`). Calling `nav.back()` and then navigating in the same tick races: the second
  navigation is dropped, so navigate straight to the target url instead.
- Shared Azurea pieces live in `src/app/ui/` (Aura, Button, Chips, Badge, SectionHeader, StayCard).
  Motion is `@keyframes`/`transition` on opacity and transform only, with a
  `prefers-reduced-motion` override in each component.
- Styling follows the Azurea design system: its tokens are CSS custom properties with
  `light-dark()` on `App`'s `:host`, read with `var()` in every component. Native header and tab
  bar props cannot read CSS, so `app.config.ts` repeats those colors.
- Read `KNOWN_ISSUES.md` before debugging (e.g. `<virtual-list>` crashes on Android in 0.1.3).
