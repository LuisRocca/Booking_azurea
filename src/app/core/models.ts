/** The kinds of place the Home and Explore chips filter by. */
export type StayCategory = 'Ciudad' | 'Playa' | 'Montaña';

/** A place to stay, as `GET /api/stays` returns it. */
export interface Stay {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly country: string;
  readonly category: StayCategory;
  readonly pricePerNight: number;
  readonly rating: number;
  readonly maxGuests: number;
  readonly imageUrl: string;
  readonly description: string;
  readonly amenities: readonly string[];
}

/** The body of `POST /api/bookings`. */
export interface BookingRequest {
  readonly stayId: string;
  /** ISO date, `yyyy-mm-dd`. */
  readonly checkIn: string;
  readonly nights: number;
  readonly guests: number;
  readonly guestName: string;
  readonly email: string;
  readonly breakfast: boolean;
}

/** A confirmed booking, as the API returns it and as the app keeps it on the device. */
export interface Booking extends BookingRequest {
  readonly id: string;
  readonly stayName: string;
  readonly city: string;
  readonly total: number;
}

/** The body the API sends with a 4xx, naming the field the error belongs to. */
export interface ApiError {
  readonly field?: 'checkIn' | 'guests';
  readonly message: string;
}
