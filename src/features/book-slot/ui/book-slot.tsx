import { useState } from 'react';
import { Button, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { addBooking, isSlotBooked } from '../../../entities/booking';
import { DEFAULT_SCHEDULE, generateSlots, type Slot } from '../../../entities/slot';
import { formatMoscowDate, formatMoscowTime } from '../../../shared';

const HORIZON_DAYS = 7;

interface FormErrors {
  name?: string;
  email?: string;
}

function validate(name: string, email: string): FormErrors {
  const errors: FormErrors = {};

  if (!name.trim()) {
    errors.name = 'Укажите имя';
  }

  if (!email.trim()) {
    errors.email = 'Укажите email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Некорректный email';
  }

  return errors;
}

export function BookSlot({ now = new Date() }: { now?: Date }) {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmed, setConfirmed] = useState(false);

  const freeSlots = generateSlots(now, DEFAULT_SCHEDULE, HORIZON_DAYS).filter(
    (slot) => !isSlotBooked(slot.start),
  );

  const handleSubmit = () => {
    const nextErrors = validate(name, email);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !selectedSlot) {
      return;
    }

    addBooking({
      slotStart: selectedSlot.start.toISOString(),
      slotEnd: selectedSlot.end.toISOString(),
      guestName: name.trim(),
      guestEmail: email.trim(),
    });
    setConfirmed(true);
  };

  if (confirmed && selectedSlot) {
    return (
      <Stack>
        <Title order={2}>Вы записаны</Title>
        <Text>
          {formatMoscowDate(selectedSlot.start)} в {formatMoscowTime(selectedSlot.start)}
        </Text>
        <Text>{name.trim()}</Text>
        <Text>{email.trim()}</Text>
      </Stack>
    );
  }

  if (selectedSlot) {
    return (
      <Stack>
        <Title order={2}>
          {formatMoscowDate(selectedSlot.start)} в {formatMoscowTime(selectedSlot.start)}
        </Title>
        <TextInput
          label="Имя"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          error={errors.name}
        />
        <TextInput
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          error={errors.email}
        />
        <Group>
          <Button variant="subtle" onClick={() => setSelectedSlot(null)}>
            Назад
          </Button>
          <Button onClick={handleSubmit}>Записаться</Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack>
      <Title order={2}>Выберите время</Title>
      {freeSlots.length === 0 ? (
        <Text c="dimmed">Нет свободных слотов</Text>
      ) : (
        freeSlots.map((slot) => (
          <Button
            key={slot.start.toISOString()}
            variant="outline"
            onClick={() => setSelectedSlot(slot)}
          >
            {formatMoscowDate(slot.start)} {formatMoscowTime(slot.start)}
          </Button>
        ))
      )}
    </Stack>
  );
}
