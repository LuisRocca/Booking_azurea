import { Component } from '@angular/core';

/**
 * The one stylesheet matched against every node, whichever component created it, and where the
 * app's font faces are declared. Never rendered: `main.ts` reads its compiled sheet with
 * `styleSheetOf(GlobalStyles)`, registers the faces with `loadFonts()` and passes the sheet to
 * `mount()` as `globalStyles`.
 *
 * Each `url()` becomes a `require` at build time, so the files ship in the bundle. A weight with
 * no face here falls back to the platform font, so declare every weight the app uses.
 *
 * https://ng-native.com/packages/expo/fonts
 */
@Component({
  selector: 'app-global-styles',
  template: '',
  styles: `
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('../../assets/fonts/PlusJakartaSans_400Regular.ttf');
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('../../assets/fonts/PlusJakartaSans_500Medium.ttf');
      font-weight: 500;
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('../../assets/fonts/PlusJakartaSans_600SemiBold.ttf');
      font-weight: 600;
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('../../assets/fonts/PlusJakartaSans_700Bold.ttf');
      font-weight: 700;
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('../../assets/fonts/PlusJakartaSans_800ExtraBold.ttf');
      font-weight: 800;
    }

    /* Azurea's one family, on every text and field in the app. */
    text,
    text-input {
      font-family: 'Plus Jakarta Sans';
    }
  `,
})
export class GlobalStyles {}
