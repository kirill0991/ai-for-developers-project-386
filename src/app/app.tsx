import { Anchor, Group } from '@mantine/core';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AppProviders } from './providers/app-providers';
import { BookingPage } from '../pages/booking';
import { BookingsPage } from '../pages/bookings';

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Group gap="md" p="md">
          <Anchor component={Link} to="/">
            Записаться
          </Anchor>
          <Anchor component={Link} to="/bookings">
            Брони
          </Anchor>
        </Group>
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
