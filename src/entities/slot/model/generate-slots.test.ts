import { describe, expect, it } from 'vitest';
import { generateSlots } from './generate-slots';
import { DEFAULT_SCHEDULE } from './schedule';

describe('generateSlots', () => {
  it('generates 18 slots for a single weekday', () => {
    const now = new Date('2026-10-19T00:00:00Z'); // Monday 03:00 Moscow
    const slots = generateSlots(now, DEFAULT_SCHEDULE, 1);

    expect(slots).toHaveLength(18);
  });

  it('skips weekends', () => {
    const now = new Date('2026-10-23T00:00:00Z'); // Friday 03:00 Moscow
    const slots = generateSlots(now, DEFAULT_SCHEDULE, 3); // Fri, Sat, Sun

    expect(slots).toHaveLength(18);
  });

  it('starts the first slot at 09:00 Moscow (06:00 UTC)', () => {
    const now = new Date('2026-10-19T00:00:00Z');
    const slots = generateSlots(now, DEFAULT_SCHEDULE, 1);

    expect(slots[0].start.toISOString()).toBe('2026-10-19T06:00:00.000Z');
  });

  it('ends the last slot at 17:30 Moscow (14:30 UTC)', () => {
    const now = new Date('2026-10-19T00:00:00Z');
    const slots = generateSlots(now, DEFAULT_SCHEDULE, 1);

    expect(slots[17].start.toISOString()).toBe('2026-10-19T14:30:00.000Z');
  });

  it('makes every slot exactly 30 minutes long', () => {
    const now = new Date('2026-10-19T00:00:00Z');
    const slots = generateSlots(now, DEFAULT_SCHEDULE, 1);

    for (const slot of slots) {
      expect(slot.end.getTime() - slot.start.getTime()).toBe(30 * 60 * 1000);
    }
  });

  it('excludes slots in the past', () => {
    const now = new Date('2026-10-19T08:45:00Z'); // Monday 11:45 Moscow
    const slots = generateSlots(now, DEFAULT_SCHEDULE, 1);

    expect(slots[0].start.toISOString()).toBe('2026-10-19T09:00:00.000Z');
    expect(slots).toHaveLength(12); // 12:00 .. 17:30
  });

  it('respects the horizon across a full week', () => {
    const now = new Date('2026-10-19T00:00:00Z'); // Monday
    const slots = generateSlots(now, DEFAULT_SCHEDULE, 7);

    expect(slots).toHaveLength(90); // 5 weekdays × 18 slots
  });
});
