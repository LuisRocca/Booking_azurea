import { Component } from '@angular/core';
import { SafeAreaProvider } from '@ng-native/components';
import { NativeStackOutlet } from '@ng-native/router';

/**
 * The shell: its host element becomes the root native stack.
 *
 * It also defines the Azurea design tokens. Custom properties cascade down the node tree into
 * every child component, and `light-dark()` follows the system's color scheme, so each screen
 * reads `var(--royal)` and gets the right blue in either theme.
 *
 * https://ng-native.com/packages/router#the-shell
 * https://ng-native.com/guide/theming#tokens-cross-component-boundaries
 */
@Component({
  selector: 'app-root',
  imports: [NativeStackOutlet, SafeAreaProvider],
  template: `
    <safe-area-provider>
      <native-stack-outlet />
    </safe-area-provider>
  `,
  styles: `
    :host {
      flex: 1;

      /* Azurea: color */
      --bg: light-dark(#eef3ff, #060b1e);
      --bg-elevated: light-dark(#ffffff, #0d1530);
      --glass: light-dark(rgba(255, 255, 255, 0.58), rgba(22, 34, 74, 0.55));
      --glass-strong: light-dark(rgba(255, 255, 255, 0.8), rgba(26, 40, 86, 0.8));
      --glass-border: light-dark(rgba(255, 255, 255, 0.8), rgba(160, 185, 255, 0.18));
      --hairline: light-dark(rgba(30, 60, 160, 0.1), rgba(170, 190, 255, 0.12));
      --ink: light-dark(#0b1638, #eef2ff);
      --ink-muted: light-dark(#4b5a80, #a7b3d6);
      --ink-subtle: light-dark(#5f6c8f, #8a97bd);
      --royal: light-dark(#2f5bea, #7b9bff);
      --royal-strong: light-dark(#1e44c8, #a3baff);
      --royal-soft: light-dark(#dce6ff, #1a2a5e);
      --on-royal: light-dark(#ffffff, #07112e);
      --sky: light-dark(#6fb8ff, #3f8fe0);
      --ice: light-dark(#cfe3ff, #15254f);
      --deep: light-dark(#16307e, #1b3a9c);
      --success: light-dark(#0b7a5c, #4fd1a5);
      --warning: light-dark(#a15c00, #ffb547);
      --danger: light-dark(#c62a3d, #ff7a88);
      --star: light-dark(#e8a200, #ffc23d);

      /* Azurea: shadow. Native has no inset shadow, so the glass shadow keeps its outer part. */
      --shadow-glass: 0 8px 32px light-dark(rgba(30, 60, 160, 0.12), rgba(0, 0, 0, 0.45));
      --shadow-float: 0 18px 48px light-dark(rgba(22, 48, 126, 0.22), rgba(0, 0, 0, 0.6));
      --shadow-royal: 0 10px 24px light-dark(rgba(47, 91, 234, 0.35), rgba(123, 155, 255, 0.3));

      /* Azurea: space and radius */
      --space-1: 4px;
      --space-2: 8px;
      --space-3: 12px;
      --space-4: 16px;
      --space-5: 20px;
      --space-6: 24px;
      --space-8: 32px;
      --space-10: 40px;
      --radius-sm: 10px;
      --radius-md: 16px;
      --radius-lg: 24px;
      --radius-xl: 32px;
      --radius-pill: 999px;
    }
  `,
})
export class App {}
