import { beforeEach, describe, expect, it } from 'vitest';
import { addBooking, isSlotBooked, listBookings } from './booking-repository';

describe('booking repository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty', () => {
    expect(listBookings()).toEqual([]);
  });

  it('adds a booking and lists it back', () => {
    addBooking({
      slotStart: '2026-10-19T06:00:00.000Z',
      slotEnd: '2026-10-19T06:30:00.000Z',
      guestName: 'Иван',
      guestEmail: 'ivan@example.com',
    });

    expect(listBookings()).toEqual([
      {
        slotStart: '2026-10-19T06:00:00.000Z',
        slotEnd: '2026-10-19T06:30:00.000Z',
        guestName: 'Иван',
        guestEmail: 'ivan@example.com',
      },
    ]);
  });

  it('marks a booked slot as booked', () => {
    const start = new Date('2026-10-19T06:00:00.000Z');
    expect(isSlotBooked(start)).toBe(false);

    addBooking({
      slotStart: start.toISOString(),
      slotEnd: '2026-10-19T06:30:00.000Z',
      guestName: 'Иван',
      guestEmail: 'ivan@example.com',
    });

    expect(isSlotBooked(start)).toBe(true);
  });

  it('persists multiple bookings', () => {
    addBooking({
      slotStart: '2026-10-19T06:00:00.000Z',
      slotEnd: '2026-10-19T06:30:00.000Z',
      guestName: 'Иван',
      guestEmail: 'ivan@example.com',
    });
    addBooking({
      slotStart: '2026-10-19T06:30:00.000Z',
      slotEnd: '2026-10-19T07:00:00.000Z',
      guestName: 'Мария',
      guestEmail: 'maria@example.com',
    });

    expect(listBookings()).toHaveLength(2);
  });

  it('lets the same email book different slots', () => {
    addBooking({
      slotStart: '2026-10-19T06:00:00.000Z',
      slotEnd: '2026-10-19T06:30:00.000Z',
      guestName: 'Иван',
      guestEmail: 'ivan@example.com',
    });
    addBooking({
      slotStart: '2026-10-19T06:30:00.000Z',
      slotEnd: '2026-10-19T07:00:00.000Z',
      guestName: 'Иван',
      guestEmail: 'ivan@example.com',
    });

    expect(listBookings()).toHaveLength(2);
  });
});
