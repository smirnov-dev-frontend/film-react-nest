import { Module } from '@nestjs/common';

import { configProvider } from '../../app.config.provider';
import { FilmsRepository } from '../films.repository';
import { databaseProvider } from './database.provider';
import { FilmsMongoRepository } from './films.mongodb.repository';

@Module({
  providers: [
    configProvider,
    databaseProvider,
    { provide: FilmsRepository, useClass: FilmsMongoRepository },
  ],
  exports: [FilmsRepository],
})
export class MongodbModule {}
