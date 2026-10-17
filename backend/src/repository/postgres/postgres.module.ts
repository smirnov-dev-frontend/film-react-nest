import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AppConfig, CONFIG, configProvider } from '../../app.config.provider';
import { FilmsRepository } from '../films.repository';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import { FilmsPostgresRepository } from './films.postgres.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      extraProviders: [configProvider],
      inject: [CONFIG],
      useFactory: (config: AppConfig): TypeOrmModuleOptions => {
        const url = new URL(config.database.url);
        return {
          type: 'postgres',
          host: url.hostname,
          port: Number(url.port) || 5432,
          database: url.pathname.slice(1),
          username: config.database.username,
          password: config.database.password,
          entities: [Film, Schedule],
          synchronize: false,
        };
      },
    }),
    TypeOrmModule.forFeature([Film, Schedule]),
  ],
  providers: [{ provide: FilmsRepository, useClass: FilmsPostgresRepository }],
  exports: [FilmsRepository],
})
export class PostgresModule {}
