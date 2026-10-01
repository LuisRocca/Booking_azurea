import { Component, computed, input } from '@angular/core';
import { Image } from '@ng-native/components';
import beach from '../../../assets/icons/beach.png';
import building from '../../../assets/icons/building.png';
import check from '../../../assets/icons/check.png';
import coffee from '../../../assets/icons/coffee.png';
import dumbbell from '../../../assets/icons/dumbbell.png';
import flame from '../../../assets/icons/flame.png';
import grid from '../../../assets/icons/grid.png';
import home from '../../../assets/icons/home.png';
import laptop from '../../../assets/icons/laptop.png';
import leaf from '../../../assets/icons/leaf.png';
import minus from '../../../assets/icons/minus.png';
import mountain from '../../../assets/icons/mountain.png';
import pin from '../../../assets/icons/pin.png';
import plus from '../../../assets/icons/plus.png';
import search from '../../../assets/icons/search.png';
import snowflake from '../../../assets/icons/snowflake.png';
import sparkle from '../../../assets/icons/sparkle.png';
import starFilled from '../../../assets/icons/star-filled.png';
import suitcase from '../../../assets/icons/suitcase.png';
import sun from '../../../assets/icons/sun.png';
import utensils from '../../../assets/icons/utensils.png';
import washer from '../../../assets/icons/washer.png';
import waves from '../../../assets/icons/waves.png';
import wifi from '../../../assets/icons/wifi.png';

/**
 * The Azurea icon set: white line icons (24 grid, 1.8 stroke) at 1x/2x/3x, tinted on device.
 * Importing `x.png` lets Metro pick the @2x/@3x file for the screen, and only the icons imported
 * here end up in the bundle. The full set is in `assets/icons/`: import one here to use it.
 *
 * https://ng-native.com/packages/components/image
 */
export const ICONS = {
  beach,
  building,
  check,
  coffee,
  dumbbell,
  flame,
  grid,
  home,
  laptop,
  leaf,
  minus,
  mountain,
  pin,
  plus,
  search,
  snowflake,
  sparkle,
  'star-filled': starFilled,
  suitcase,
  sun,
  utensils,
  washer,
  waves,
  wifi,
} as const;

export type IconName = keyof typeof ICONS;

/** Which design token paints the icon. */
export type IconTone = 'ink' | 'muted' | 'royal' | 'royal-strong' | 'on-royal' | 'star';

/**
 * One icon, tinted with a design token: `tint-color: var(--royal)` in CSS reaches native as
 * the image's `tintColor`, so the icon follows light and dark like any text.
 *
 * Decorative by default, like an `<image>` with no `alt`. Pass `label` when the icon is the only
 * thing saying what something is.
 */
@Component({
  selector: 'app-icon',
  imports: [Image],
  template: `
    <image
      [source]="source()"
      [alt]="label()"
      resizeMode="contain"
      class="icon"
      [attr.data-tone]="tone()"
      [style.width.px]="size()"
      [style.height.px]="size()"
    />
  `,
  styles: `
    .icon {
      tint-color: var(--ink);
    }
    .icon[data-tone='muted'] {
      tint-color: var(--ink-muted);
    }
    .icon[data-tone='royal'] {
      tint-color: var(--royal);
    }
    .icon[data-tone='royal-strong'] {
      tint-color: var(--royal-strong);
    }
    .icon[data-tone='on-royal'] {
      tint-color: var(--on-royal);
    }
    .icon[data-tone='star'] {
      tint-color: var(--star);
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(18);
  readonly tone = input<IconTone>('ink');
  readonly label = input<string>();

  protected readonly source = computed(() => ICONS[this.name()]);
}
