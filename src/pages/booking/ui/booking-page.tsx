import { Center, Stack, Text, Title } from '@mantine/core';
import { BookSlot } from '../../../features/book-slot';

export function BookingPage() {
  return (
    <Center mih="100vh">
      <Stack align="flex-start">
        <Title order={1}>Календарь звонков</Title>
        <Text c="dimmed">Упрощённый сервис бронирования времени по мотивам Cal.com</Text>
        <BookSlot />
      </Stack>
    </Center>
  );
}
