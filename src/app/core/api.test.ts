import { HttpErrorResponse } from '@angular/common/http';
import { Component, type Injector } from '@angular/core';
import { render } from '@ng-native/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { appProviders } from '../app.config.ts';
import { isoDate } from './booking-rules.ts';
import { BookingsService } from './bookings.service.ts';
import { FULLY_BOOKED_DAY_OFFSET } from './mock-api/mock-api.interceptor.ts';
import type { BookingRequest } from './models.ts';
import { StaysService } from './stays.service.ts';

// The services through a real HttpClient and the fake API's interceptor, as the app runs them.
// An empty component is mounted only for its injector.
// https://ng-native.com/packages/testing/testing-services

@Component({ selector: 'app-host', template: '' })
class Host {}

let injector: Injector;

beforeEach(async () => {
  const { componentRef } = await render(Host, { providers: appProviders });
  injector = componentRef.injector;
});

const request = (overrides: Partial<BookingRequest> = {}): BookingRequest => ({
  stayId: 'lisbon-alfama',
  checkIn: isoDate(1),
  nights: 2,
  guests: 2,
  guestName: 'Ada Lovelace',
  email: 'ada@example.com',
  breakfast: false,
  ...overrides,
});

/** The rejection a call ends with, so a test can assert on its status and body. */
async function failure(call: Promise<unknown>): Promise<HttpErrorResponse> {
  const error = await call.then(
    () => undefined,
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(HttpErrorResponse);
  return error as HttpErrorResponse;
}

describe('StaysService', () => {
  it('lists every stay', async () => {
    const stays = await injector.get(StaysService).list();

    expect(stays).toHaveLength(6);
    expect(stays.map((stay) => stay.category)).toContain('Playa');
  });

  it('gets one stay by id', async () => {
    const stay = await injector.get(StaysService).get('cusco-sanblas');

    expect(stay.name).toBe('Casa colonial en San Blas');
  });

  it('answers 404 for a stay that does not exist', async () => {
    const error = await failure(injector.get(StaysService).get('atlantis'));

    expect(error.status).toBe(404);
  });
});

describe('BookingsService', () => {
  it('confirms a booking with its total and keeps it', async () => {
    const bookings = injector.get(BookingsService);

    const booking = await bookings.create(request({ breakfast: true }));

    expect(booking).toMatchObject({ stayName: 'Loft en Alfama', total: 2 * (95 + 12 * 2) });
    expect(bookings.bookings()).toEqual([booking]);
    expect(bookings.count()).toBe(1);
  });

  it('refuses more guests than the stay allows, and saves nothing', async () => {
    const bookings = injector.get(BookingsService);

    const error = await failure(bookings.create(request({ guests: 3 })));

    expect(error.status).toBe(422);
    expect(error.error).toEqual({ field: 'guests', message: 'Máximo 2 huéspedes.' });
    expect(bookings.count()).toBe(0);
  });

  it('refuses the fully booked day', async () => {
    const error = await failure(
      injector.get(BookingsService).create(request({ checkIn: isoDate(FULLY_BOOKED_DAY_OFFSET) })),
    );

    expect(error.status).toBe(409);
    expect(error.error).toMatchObject({ field: 'checkIn' });
  });

  it('cancels a booking by id', async () => {
    const bookings = injector.get(BookingsService);
    const kept = await bookings.create(request());
    const cancelled = await bookings.create(request({ stayId: 'cusco-sanblas' }));

    bookings.cancel(cancelled.id);

    expect(bookings.bookings()).toEqual([kept]);
  });
});
