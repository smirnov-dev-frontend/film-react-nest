import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import * as path from 'node:path';

import { configProvider, validateEnv } from './app.config.provider';
import { FilmsController } from './films/films.controller';
import { OrderController } from './order/order.controller';
import { FilmsService } from './films/films.service';
import { OrderService } from './order/order.service';
import { PostgresModule } from './repository/postgres/postgres.module';
import { loggerProvider } from './logger/logger.provider';

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
      exclude: ['/content/afisha/(.*)'],
    }),
    PostgresModule,
  ],
  controllers: [FilmsController, OrderController],
  providers: [configProvider, loggerProvider, FilmsService, OrderService],
})
export class AppModule {}
