import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import { createDb, type Db } from './db';
import { registerBookingsRoutes } from './routes/bookings';
import { registerEventTypesRoutes } from './routes/event-types';
import { registerSlotsRoutes } from './routes/slots';

export interface BuildAppOptions {
  db?: Db;
  logger?: boolean;
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const db = options.db ?? createDb();

  void app.register(cors, { origin: true });

  registerEventTypesRoutes(app, db);
  registerSlotsRoutes(app, db);
  registerBookingsRoutes(app, db);

  return app;
}
