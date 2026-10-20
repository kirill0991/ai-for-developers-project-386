// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from './app';
import { createDb } from './db';

describe('API', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(async () => {
    app = buildApp({ db: createDb(':memory:') });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('event types', () => {
    it('creates an event type and returns 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '30 минут', duration: 30 },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        name: 'Консультация',
        description: '30 минут',
        duration: 30,
      });
      expect(response.json().id).toBeTruthy();
    });

    it('lists created event types', async () => {
      await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });

      const response = await app.inject({ method: 'GET', url: '/event-types' });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveLength(1);
      expect(response.json()[0]).toMatchObject({ name: 'Консультация' });
    });

    it('rejects an event type with an empty name', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: '', description: '', duration: 30 },
      });

      expect(response.statusCode).toBe(400);
    });

    it('rejects an event type with a non-positive duration', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 0 },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('slots', () => {
    it('returns 404 for an unknown event type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/slots?typeId=missing&from=2026-10-19T00:00:00Z&to=2026-10-20T00:00:00Z',
      });

      expect(response.statusCode).toBe(404);
    });

    it('generates 18 free slots for a 30-minute type over one day', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });
      const typeId = created.json().id;

      const response = await app.inject({
        method: 'GET',
        url: `/slots?typeId=${typeId}&from=2026-10-19T00:00:00Z&to=2026-10-20T00:00:00Z`,
      });

      expect(response.statusCode).toBe(200);
      const slots = response.json();
      expect(slots).toHaveLength(18);
      expect(slots[0]).toEqual({
        start: '2026-10-19T06:00:00.000Z',
        end: '2026-10-19T06:30:00.000Z',
        status: 'free',
      });
      expect(slots.every((slot: { status: string }) => slot.status === 'free')).toBe(true);
    });

    it('marks a slot as occupied after it is booked', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });
      const typeId = created.json().id;

      await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Иван',
          email: 'ivan@example.com',
          typeId,
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/slots?typeId=${typeId}&from=2026-10-19T00:00:00Z&to=2026-10-20T00:00:00Z`,
      });

      const slots = response.json();
      expect(slots[0].status).toBe('occupied');
      expect(slots.slice(1).every((slot: { status: string }) => slot.status === 'free')).toBe(true);
    });
  });

  describe('bookings', () => {
    it('creates a booking and returns 201', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });
      const typeId = created.json().id;

      const response = await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Иван',
          email: 'ivan@example.com',
          typeId,
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        name: 'Иван',
        email: 'ivan@example.com',
        typeId,
        slotStart: '2026-10-19T06:00:00.000Z',
        slotEnd: '2026-10-19T06:30:00.000Z',
      });
    });

    it('rejects a conflicting booking with 409', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });
      const typeId = created.json().id;

      const first = await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Иван',
          email: 'ivan@example.com',
          typeId,
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });
      expect(first.statusCode).toBe(201);

      const conflict = await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Мария',
          email: 'maria@example.com',
          typeId,
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });

      expect(conflict.statusCode).toBe(409);
    });

    it('rejects a booking for an unknown event type with 404', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Иван',
          email: 'ivan@example.com',
          typeId: 'missing',
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('rejects a booking with an invalid email', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });
      const typeId = created.json().id;

      const response = await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Иван',
          email: 'not-an-email',
          typeId,
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('lists bookings', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/event-types',
        payload: { name: 'Консультация', description: '', duration: 30 },
      });
      const typeId = created.json().id;

      await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          name: 'Иван',
          email: 'ivan@example.com',
          typeId,
          slotStart: '2026-10-19T06:00:00.000Z',
        },
      });

      const response = await app.inject({ method: 'GET', url: '/bookings' });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveLength(1);
      expect(response.json()[0]).toMatchObject({ name: 'Иван' });
    });
  });
});
