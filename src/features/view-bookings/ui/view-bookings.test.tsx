import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ViewBookings } from './view-bookings';

function renderWithProviders(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('ViewBookings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows an empty state when there are no bookings', () => {
    renderWithProviders(<ViewBookings />);

    expect(screen.getByText('Пока нет броней')).toBeTruthy();
  });

  it('lists bookings with date, time, name and email', () => {
    localStorage.setItem(
      'bookings',
      JSON.stringify([
        {
          slotStart: '2026-10-19T06:00:00.000Z', // 09:00 Moscow
          slotEnd: '2026-10-19T06:30:00.000Z',
          guestName: 'Иван',
          guestEmail: 'ivan@example.com',
        },
      ]),
    );

    renderWithProviders(<ViewBookings />);

    expect(screen.getByText('19.10')).toBeTruthy();
    expect(screen.getByText('09:00')).toBeTruthy();
    expect(screen.getByText('Иван')).toBeTruthy();
    expect(screen.getByText('ivan@example.com')).toBeTruthy();
  });
});
