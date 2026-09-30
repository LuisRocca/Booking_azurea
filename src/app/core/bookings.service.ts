import { HttpClient } from '@angular/common/http';
import { Service, computed, inject } from '@angular/core';
import { Storage } from '@ng-native/expo/store';
import { firstValueFrom } from 'rxjs';
import { API_URL } from './mock-api/mock-api.interceptor.ts';
import type { Booking, BookingRequest } from './models.ts';

/**
 * The API confirms a booking; the device remembers it. `Storage.signal()` is a two-way signal:
 * reading it reads the stored list, setting it writes the list back to AsyncStorage.
 *
 * https://ng-native.com/packages/expo/storage
 */
@Service()
export class BookingsService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Storage);
  private readonly saved = this.store.signal<Booking[]>('bookings', []);

  readonly bookings = this.saved.asReadonly();
  readonly count = computed(() => this.saved().length);

  /** Rejects with the `HttpErrorResponse` when the API refuses; nothing is saved then. */
  async create(request: BookingRequest): Promise<Booking> {
    const booking = await firstValueFrom(this.http.post<Booking>(`${API_URL}/bookings`, request));
    // `update` rather than `set`: a booking made before the stored list is read back is added to
    // it instead of replacing it. See "signal(key, initial)" on the Storage page.
    this.saved.update((list) => [booking, ...list]);
    return booking;
  }

  cancel(id: string): void {
    this.saved.update((list) => list.filter((booking) => booking.id !== id));
  }
}
