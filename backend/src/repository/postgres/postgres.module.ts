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
      useFactory: ({ database }: AppConfig): TypeOrmModuleOptions => ({
        type: database.driver,
        host: database.host,
        port: database.port,
        database: database.name,
        username: database.username,
        password: database.password,
        entities: [Film, Schedule],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([Film, Schedule]),
  ],
  providers: [{ provide: FilmsRepository, useClass: FilmsPostgresRepository }],
  exports: [FilmsRepository],
})
export class PostgresModule {}
