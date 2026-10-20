import type { FastifyInstance } from 'fastify';
import type { Db } from '../db';
import type { BookingCreate } from '../domain/types';
import { createBooking, findConflictingBooking, listBookings } from '../repositories/bookings';
import { getEventType } from '../repositories/event-types';
import { bookingCreateSchema, bookingSchema, errorSchema } from '../schemas';

export function registerBookingsRoutes(app: FastifyInstance, db: Db): void {
  app.get(
    '/bookings',
    {
      schema: {
        response: {
          200: { type: 'array', items: bookingSchema },
        },
      },
    },
    async () => listBookings(db),
  );

  app.post(
    '/bookings',
    {
      schema: {
        body: bookingCreateSchema,
        response: {
          201: bookingSchema,
          404: errorSchema,
          409: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { name, email, typeId, slotStart } = request.body as BookingCreate;

      const eventType = getEventType(db, typeId);
      if (!eventType) {
        return reply.code(404).send({ message: 'Тип события не найден' });
      }

      const start = new Date(slotStart);
      const slotEnd = new Date(start.getTime() + eventType.duration * 60 * 1000).toISOString();

      const conflict = findConflictingBooking(db, slotStart, slotEnd);
      if (conflict) {
        return reply.code(409).send({ message: 'Слот уже занят' });
      }

      const booking = createBooking(db, { name, email, typeId, slotStart, slotEnd });
      reply.code(201);
      return booking;
    },
  );
}
