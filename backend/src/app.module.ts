import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConditionalModule, ConfigModule } from '@nestjs/config';
import * as path from 'node:path';

import {
  configProvider,
  DatabaseDriver,
  validateEnv,
} from './app.config.provider';
import { FilmsController } from './films/films.controller';
import { OrderController } from './order/order.controller';
import { FilmsService } from './films/films.service';
import { OrderService } from './order/order.service';
import { MongodbModule } from './repository/mongodb/mongodb.module';
import { PostgresModule } from './repository/postgres/postgres.module';

const isDriver =
  (driver: DatabaseDriver) =>
  (env: NodeJS.ProcessEnv): boolean =>
    env.DATABASE_DRIVER === driver;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
    }),
    ConditionalModule.registerWhen(PostgresModule, isDriver('postgres')),
    ConditionalModule.registerWhen(MongodbModule, isDriver('mongodb')),
  ],
  controllers: [FilmsController, OrderController],
  providers: [configProvider, FilmsService, OrderService],
})
export class AppModule {}
