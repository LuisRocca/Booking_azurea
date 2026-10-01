import { Service, computed, inject } from '@angular/core';
import { Storage } from '@ng-native/expo/store';

/**
 * Whether this device has seen the Welcome screen. Kept with `Storage`, like the bookings, so it
 * is shown once and never again.
 *
 * `shouldWelcome` waits for `ready`: until the stored value is read back the signal holds its
 * initial `false`, and deciding then would flash Welcome at someone who has already seen it.
 *
 * https://ng-native.com/packages/expo/storage
 */
@Service()
export class OnboardingService {
  private readonly store = inject(Storage);
  private readonly seen = this.store.signal<boolean>('welcomed', false);

  readonly shouldWelcome = computed(() => this.store.ready() && !this.seen());

  finish(): void {
    this.seen.set(true);
  }
}
