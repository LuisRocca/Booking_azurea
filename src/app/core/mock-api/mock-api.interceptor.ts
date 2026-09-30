import {
  HttpErrorResponse,
  HttpResponse,
  type HttpEvent,
  type HttpInterceptorFn,
  type HttpRequest,
} from '@angular/common/http';
import { type Observable, of, switchMap, throwError, timer } from 'rxjs';
import { bookingTotal, isoDate } from '../booking-rules.ts';
import type { ApiError, Booking, BookingRequest } from '../models.ts';
import { STAYS } from './stays.data.ts';

/**
 * A backend that lives in the app: every request to `/api/...` is answered here and never reaches
 * the network. The app still goes through a real `HttpClient`, so swapping this for a server is
 * removing the interceptor from `app.config.ts` and pointing `API_URL` at it.
 *
 * Interceptors: https://ng-native.com/guide/offline#an-interceptor-for-the-same-reconnect-signal-everywhere
 */
export const API_URL = '/api';

/** Enough to see the loading states; short enough for the tests' one-second `findBy*`. */
const LATENCY_MS = 300;

/** Every stay is taken the day after tomorrow, so the form can show a server-side error. */
export const FULLY_BOOKED_DAY_OFFSET = 2;

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(`${API_URL}/`)) return next(req);
  return timer(LATENCY_MS).pipe(switchMap(() => respond(req)));
};

function respond(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const path = req.url.slice(API_URL.length);

  if (req.method === 'GET' && path === '/stays') return ok(STAYS);

  const stayMatch = /^\/stays\/([\w-]+)$/.exec(path);
  if (req.method === 'GET' && stayMatch) {
    const stay = STAYS.find((candidate) => candidate.id === stayMatch[1]);
    return stay ? ok(stay) : fail(req, 404, { message: 'Ese alojamiento no existe.' });
  }

  if (req.method === 'POST' && path === '/bookings') {
    return createBooking(req as HttpRequest<BookingRequest>);
  }

  return fail(req, 404, { message: `Nada responde a ${req.method} ${req.url}.` });
}

function createBooking(req: HttpRequest<BookingRequest>): Observable<HttpEvent<unknown>> {
  const request = req.body;
  const stay = request && STAYS.find((candidate) => candidate.id === request.stayId);
  if (!request || !stay) return fail(req, 404, { message: 'Ese alojamiento no existe.' });

  // The server re-checks what the form already checked: a client can always be bypassed.
  if (request.guests < 1 || request.guests > stay.maxGuests) {
    return fail(req, 422, { field: 'guests', message: `Máximo ${stay.maxGuests} huéspedes.` });
  }
  if (request.checkIn === isoDate(FULLY_BOOKED_DAY_OFFSET)) {
    return fail(req, 409, { field: 'checkIn', message: 'Ya no hay disponibilidad ese día.' });
  }

  const booking: Booking = {
    ...request,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    stayName: stay.name,
    city: stay.city,
    total: bookingTotal(stay, request),
  };
  return ok(booking, 201);
}

function ok<T>(body: T, status = 200): Observable<HttpEvent<T>> {
  return of(new HttpResponse({ status, body }));
}

function fail(req: HttpRequest<unknown>, status: number, error: ApiError): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, error, url: req.url }));
}
