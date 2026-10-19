import { Button, Center, Stack, Text, Title } from '@mantine/core';

export function BookingPage() {
  return (
    <Center mih="100vh">
      <Stack align="flex-start">
        <Title order={1}>Календарь звонков</Title>
        <Text c="dimmed">Упрощённый сервис бронирования времени по мотивам Cal.com</Text>
        <Button>Записаться на звонок</Button>
      </Stack>
    </Center>
  );
}
