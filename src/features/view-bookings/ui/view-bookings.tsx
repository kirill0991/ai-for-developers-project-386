import { Stack, Table, Text, Title } from '@mantine/core';
import { listBookings } from '../../../entities/booking';
import { formatMoscowDate, formatMoscowTime } from '../../../shared';

export function ViewBookings() {
  const bookings = listBookings();

  if (bookings.length === 0) {
    return <Text c="dimmed">Пока нет броней</Text>;
  }

  return (
    <Stack>
      <Title order={2}>Брони</Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Дата</Table.Th>
            <Table.Th>Время</Table.Th>
            <Table.Th>Имя</Table.Th>
            <Table.Th>Email</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {bookings.map((booking) => (
            <Table.Tr key={booking.slotStart}>
              <Table.Td>{formatMoscowDate(new Date(booking.slotStart))}</Table.Td>
              <Table.Td>{formatMoscowTime(new Date(booking.slotStart))}</Table.Td>
              <Table.Td>{booking.guestName}</Table.Td>
              <Table.Td>{booking.guestEmail}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
