import { buildApp } from './app';
import { createDb } from './db';

const db = createDb(process.env.DB_PATH ?? 'calendar.db');
const app = buildApp({ db, logger: true });

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

app
  .listen({ port, host })
  .then(() => {
    app.log.info(`Сервер запущен на http://${host}:${port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
