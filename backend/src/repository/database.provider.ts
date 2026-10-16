import { Connection, createConnection } from 'mongoose';

import { AppConfig, CONFIG } from '../app.config.provider';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const databaseProvider = {
  provide: DATABASE_CONNECTION,
  inject: [CONFIG],
  useFactory: (config: AppConfig): Promise<Connection> =>
    createConnection(config.database.url).asPromise(),
};
