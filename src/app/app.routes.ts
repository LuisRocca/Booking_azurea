import type { Routes } from '@angular/router';
import { BookingPage } from './features/booking/booking.page.ts';
import { BookingsPage } from './features/bookings/bookings.page.ts';
import { ExplorePage } from './features/explore/explore.page.ts';
import { StayDetailPage } from './features/stay-detail/stay-detail.page.ts';
import { TabStack } from './features/tabs/tab-stack.ts';
import { TabsPage } from './features/tabs/tabs.page.ts';

/**
 * The root stack holds the tab bar and, above it, the booking form presented as a modal.
 * Each tab has a stack of its own, so a stay's detail is pushed inside the tab, with its header
 * and its back button, and the tab bar stays visible underneath.
 *
 * https://ng-native.com/packages/router/tabs
 * https://ng-native.com/packages/router/screens#pushing-from-a-presented-screen
 */
export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: '', redirectTo: 'explore', pathMatch: 'full' },
      {
        path: 'explore',
        component: TabStack,
        children: [
          { path: '', component: ExplorePage },
          { path: 'stay/:id', component: StayDetailPage }, // /explore/stay/lisbon-alfama
        ],
      },
      {
        path: 'bookings',
        component: TabStack,
        children: [{ path: '', component: BookingsPage }],
      },
    ],
  },
  { path: 'book/:stayId', component: BookingPage }, // nav.present(['/book', id])
];
