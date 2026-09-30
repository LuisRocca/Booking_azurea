import { AppRegistry, Image, Platform, processColor } from 'react-native';
import { mount } from '@ng-native/platform';
import { currentConditions, deviceTokens, watchConditions } from '@ng-native/device';
import { loadFonts } from '@ng-native/expo/fonts';
import { getFabricUIManager, registerPlatformComponents, styleSheetOf } from '@ng-native/fabric';
import { appProviders } from './app/app.config.ts';
import { App } from './app/app.ts';
import { GlobalStyles } from './app/global-styles.ts';

registerPlatformComponents(Platform.OS);

AppRegistry.registerRunnable('main', ({ rootTag }: { rootTag: number | string }) => {
  const globalStyles = styleSheetOf(GlobalStyles);
  // Registers the @font-face files. Mounting does not wait: text re-lays out as each face lands.
  void loadFonts(globalStyles);

  const app = mount(Number(rootTag), App, getFabricUIManager(), {
    // Matched against every node: the font family for all text. See global-styles.ts.
    globalStyles,
    // The router and HttpClient, shared with the tests: see app.config.ts.
    providers: appProviders,
    // Colours, as the integers the platform wants.
    processColor,
    // What `@media` resolves against. Without it every media query is false and a responsive
    // layout renders as its smallest case.
    conditions: currentConditions(),
    // Values only the device knows - the hairline width, which is a third of a point on a 3x
    // screen. Without it `1px` is what you get, and that is a visibly fat divider.
    tokens: deviceTokens(),
    // Turns a `require('./x.png')` into something native can load. Without it images are blank.
    resolveAssetSource: (value) => Image.resolveAssetSource(value as never),
  });

  // Re-resolves the conditions when the device rotates or the theme changes. A rotation dirties
  // no component and no binding, so without this nothing re-renders and `dark:` stops following
  // the system switch.
  watchConditions(app.engine);
});
