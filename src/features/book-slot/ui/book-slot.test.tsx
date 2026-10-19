import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { BookSlot } from './book-slot';

function renderWithProviders(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('BookSlot', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('lets a guest book a free slot', async () => {
    const user = userEvent.setup();
    const now = new Date('2026-10-19T00:00:00Z'); // Monday 03:00 Moscow
    renderWithProviders(<BookSlot now={now} />);

    await user.click(screen.getByRole('button', { name: '19.10 09:00' }));

    await user.type(screen.getByLabelText('Имя'), 'Иван');
    await user.type(screen.getByLabelText('Email'), 'ivan@example.com');
    await user.click(screen.getByRole('button', { name: 'Записаться' }));

    expect(screen.getByText('Иван')).toBeTruthy();
    expect(screen.getByText('ivan@example.com')).toBeTruthy();
  });

  it('shows validation errors for an empty form', async () => {
    const user = userEvent.setup();
    const now = new Date('2026-10-19T00:00:00Z');
    renderWithProviders(<BookSlot now={now} />);

    await user.click(screen.getByRole('button', { name: '19.10 09:00' }));
    await user.click(screen.getByRole('button', { name: 'Записаться' }));

    expect(screen.getByText('Укажите имя')).toBeTruthy();
    expect(screen.getByText('Укажите email')).toBeTruthy();
  });

  it('rejects an invalid email', async () => {
    const user = userEvent.setup();
    const now = new Date('2026-10-19T00:00:00Z');
    renderWithProviders(<BookSlot now={now} />);

    await user.click(screen.getByRole('button', { name: '19.10 09:00' }));
    await user.type(screen.getByLabelText('Имя'), 'Иван');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Записаться' }));

    expect(screen.getByText('Некорректный email')).toBeTruthy();
  });

  it('does not show already-booked slots', () => {
    const now = new Date('2026-10-19T00:00:00Z');
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

    renderWithProviders(<BookSlot now={now} />);

    expect(screen.queryByRole('button', { name: '19.10 09:00' })).toBeNull();
    expect(screen.getByRole('button', { name: '19.10 09:30' })).toBeTruthy();
  });
});
