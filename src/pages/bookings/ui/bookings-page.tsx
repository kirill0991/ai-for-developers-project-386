import { Center, Stack, Title } from '@mantine/core';
import { ViewBookings } from '../../../features/view-bookings';

export function BookingsPage() {
  return (
    <Center mih="100vh">
      <Stack align="flex-start">
        <Title order={1}>Брони</Title>
        <ViewBookings />
      </Stack>
    </Center>
  );
}
