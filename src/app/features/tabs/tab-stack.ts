import { Component } from '@angular/core';
import { NativeStackOutlet } from '@ng-native/router';

/**
 * A tab's own stack: its child routes push inside the tab, each with a native header.
 *
 * https://ng-native.com/packages/router/screens#pushing-from-a-presented-screen
 */
@Component({
  selector: 'app-tab-stack',
  imports: [NativeStackOutlet],
  template: '<native-stack-outlet />',
  styles: `
    :host {
      flex: 1;
    }
  `,
})
export class TabStack {}
