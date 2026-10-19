import { AppProviders } from './providers/app-providers';
import { BookingPage } from '../pages/booking';

export function App() {
  return (
    <AppProviders>
      <BookingPage />
    </AppProviders>
  );
}
