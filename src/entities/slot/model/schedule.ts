export interface Schedule {
  /** Days of the week that are working days, 0 = Sunday .. 6 = Saturday. */
  weekdays: number[];
  /** First working hour, inclusive. */
  startHour: number;
  /** Last working hour, exclusive. */
  endHour: number;
  /** Slot length in minutes. */
  slotMinutes: number;
}

export const DEFAULT_SCHEDULE: Schedule = {
  weekdays: [1, 2, 3, 4, 5], // Monday .. Friday
  startHour: 9,
  endHour: 18,
  slotMinutes: 30,
};
