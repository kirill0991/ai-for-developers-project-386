import { MOSCOW_OFFSET_HOURS, toMoscow } from '../../../shared';
import type { Schedule } from './schedule';
import type { Slot } from './slot';

/**
 * Generates the bookable slots for the next `horizonDays` days, starting from
 * `now`. Slots are aligned to the schedule's working hours and slot length,
 * and only strictly-future slots are returned.
 */
export function generateSlots(now: Date, schedule: Schedule, horizonDays: number): Slot[] {
  const slots: Slot[] = [];

  const moscowNow = toMoscow(now);
  const todayYear = moscowNow.getUTCFullYear();
  const todayMonth = moscowNow.getUTCMonth();
  const todayDay = moscowNow.getUTCDate();

  for (let dayOffset = 0; dayOffset < horizonDays; dayOffset += 1) {
    const dayDate = new Date(Date.UTC(todayYear, todayMonth, todayDay + dayOffset));
    const weekday = dayDate.getUTCDay();

    if (!schedule.weekdays.includes(weekday)) {
      continue;
    }

    const year = dayDate.getUTCFullYear();
    const month = dayDate.getUTCMonth();
    const day = dayDate.getUTCDate();

    const lastStartMinutes = schedule.endHour * 60 - schedule.slotMinutes;
    for (let minutes = schedule.startHour * 60; minutes <= lastStartMinutes; minutes += schedule.slotMinutes) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;

      const start = new Date(Date.UTC(year, month, day, hour - MOSCOW_OFFSET_HOURS, minute));
      const end = new Date(start.getTime() + schedule.slotMinutes * 60 * 1000);

      if (start.getTime() > now.getTime()) {
        slots.push({ start, end });
      }
    }
  }

  return slots;
}
