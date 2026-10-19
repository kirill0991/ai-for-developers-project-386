export interface Booking {
  /** Slot start as an ISO 8601 string. */
  slotStart: string;
  /** Slot end as an ISO 8601 string. */
  slotEnd: string;
  guestName: string;
  guestEmail: string;
}

const STORAGE_KEY = 'bookings';

export function listBookings(): Booking[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as Booking[];
  } catch {
    return [];
  }
}

export function addBooking(booking: Booking): void {
  const bookings = listBookings();
  bookings.push(booking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function isSlotBooked(slotStart: Date): boolean {
  const iso = slotStart.toISOString();
  return listBookings().some((booking) => booking.slotStart === iso);
}
