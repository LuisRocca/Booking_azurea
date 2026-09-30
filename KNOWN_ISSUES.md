# Known issues

Read before debugging. Format: problem → cause → fix / prevention.

## `<virtual-list>` crashes on Android: "ScrollView can host only one direct child"

- **Problem:** on Android the app renders nothing and logcat shows
  `IllegalStateException: addViewAt: failed to insert view ... Caused by: ScrollView can host only one direct child`.
  iOS and the Vitest tests are fine, so nothing catches it before a device.
- **Cause:** in `@ng-native/components` 0.1.3 (and 0.2.0) `<virtual-list>` commits its header,
  rows and footer as three direct children of the native `RCTScrollView`. Android's `ScrollView`
  accepts one. `<scroll-view>` is not affected: it wraps its content in one container.
- **Fix / prevention:** the Explore list uses `<scroll-view>`, which is also what the docs
  recommend for short content. Use `<virtual-list>` again only after checking a new release on
  Android: dump the tree in a test (`render(...).debug()`) and count the `ScrollView`'s direct
  children, or run it on an emulator.

## Metro: "Unable to resolve module expo-secure-store"

- **Problem:** the bundle fails as soon as `@ng-native/expo/store` is imported, even when the app
  only uses `Storage` (AsyncStorage).
- **Cause:** `@ng-native/expo/dist/store.js` has a static `require('expo-secure-store')` for
  `SecureStorage`, and Metro resolves every static require at bundle time.
- **Fix / prevention:** install both, as the Storage page's install command does:
  `npx expo install @react-native-async-storage/async-storage expo-secure-store`.

## Tests: pressing a `<switch>` does not toggle it

- **Problem:** `userEvent.press(switch)` leaves the switch unchanged.
- **Cause:** a native switch changes by its own `change` event, not by a touch.
- **Fix:** `await fireEvent(switchNode, 'change', { value: true })`
  (see `booking.page.test.ts`).

## Tests: "require is not a function" when importing `GlobalStyles`

- **Problem:** a test that imports `src/app/global-styles.ts` fails to load.
- **Cause:** each `@font-face` `url()` compiles to a `require()` so Metro ships the file, and
  Vitest runs ESM, where `require` does not exist.
- **Fix / prevention:** keep `GlobalStyles` out of tests (only `main.ts` imports it). Check fonts
  with a Metro build instead: `npx expo export --platform android --dump-assetmap` lists the `.ttf`
  files it bundled.
