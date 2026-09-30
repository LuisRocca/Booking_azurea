import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_URL } from './mock-api/mock-api.interceptor.ts';
import type { Stay } from './models.ts';

/**
 * Promises rather than observables, so a page reads them with `resource({ loader })` and a test
 * replaces the whole service with a plain object.
 *
 * https://ng-native.com/packages/testing/testing-services
 */
@Service()
export class StaysService {
  private readonly http = inject(HttpClient);

  list(): Promise<readonly Stay[]> {
    return firstValueFrom(this.http.get<Stay[]>(`${API_URL}/stays`));
  }

  get(id: string): Promise<Stay> {
    return firstValueFrom(this.http.get<Stay>(`${API_URL}/stays/${id}`));
  }
}
