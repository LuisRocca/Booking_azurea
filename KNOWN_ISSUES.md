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

## Android emulator: Expo Go shows a white or black screen and ignores taps

- **Problem:** Metro serves the bundle and logcat shows `Running "main"` with no JS error, but
  Expo Go's window never draws (white on the device, black in `adb exec-out screencap`), its dev
  menu ignores taps and Android eventually reports an ANR. The template app does the same, so it
  is not the app.
- **Cause:** host GPU rendering (`hw.gpu.mode=auto`) on this Linux host (AMD Radeon, Mesa) with
  the API 36 image: HWUI logs EGL config failures. `-gpu swiftshader_indirect` segfaults (exit 139).
- **Fix:** start the emulator with SwANGLE software rendering:
  `~/Android/Sdk/emulator/emulator @QodeOS-Pixel -gpu swangle_indirect -no-snapshot-load`.
  Give the AVD at least 4 GB (`hw.ramSize=4096` in its `config.ini`, no unit suffix).

## Labels cut short by one or two letters (chips: "Tod", "Ciuda")

- **Problem:** on Android, text with a natural width, such as a chip label, renders clipped at
  the end. Text with a set width (`flex: 1`, `numberOfLines`) looks fine.
- **Cause:** the app mounted before the Plus Jakarta Sans faces were registered. Text was
  measured in the narrower fallback font and kept that width once the custom face drew it.
- **Fix / prevention:** `main.ts` awaits `loadFonts()` before `mount()`, as the Fonts page shows.
  Never fire and forget it.

## Metro: "Unable to resolve module" for a file that exists

- **Problem:** after creating a file (e.g. `src/app/ui/icon.ts`) the device shows a 500 from Metro
  with `UnableToResolveError`, though the file is there and `npx expo export` bundles fine. Edits
  do not hot reload either.
- **Cause:** that Metro process had stopped receiving file-watcher events, so its file map never
  learned about new or changed files. Why it stopped is not known: a Metro started from the same
  path (`/home`, a symlink to `/var/home` on Silverblue) picked up a new file when tested, so the
  symlink is not the cause.
- **Fix / prevention:** restart Metro with a cleared cache: `npx expo start --clear`. Compare with
  `npx expo export --platform android` to tell a stale Metro from a real resolution error. Do not
  set `CI=1` for development: it turns watch mode and reloads off.

## Android tab bar stays lilac, and bars ignore the app font

- **Problem:** the bottom bar keeps Material's lilac background and selection pill, and the tab
  labels and header titles draw in Roboto, though `withTabDefaults` sets a `backgroundColor`.
- **Cause:** a tabs outlet's `backgroundColor` paints the container behind the screens, not the
  bar. The bar reads `standardAppearance`, and Android reads its label font and active indicator
  at that object's top level, keys `TabAppearance` does not type. Bar props also bypass the CSS
  font matching, so they need a registered face name.
- **Fix / prevention:** `app.config.ts` sets `standardAppearance` with `tabBarBackgroundColor`,
  the Android keys (`tabBarItemActiveIndicatorColor` as a packed ARGB integer, since the router
  passes it through unprocessed) and fonts by face name: `Plus Jakarta Sans-600`,
  `Plus Jakarta Sans-700`.
