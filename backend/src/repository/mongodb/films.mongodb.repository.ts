import { Inject, Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';

import { FilmDto, ScheduleDto } from '../../films/dto/films.dto';
import { toFilmDto, toScheduleDto } from '../films.mapper';
import { FilmsRepository } from '../films.repository';
import { DATABASE_CONNECTION } from './database.provider';
import { FilmSchema } from './films.schema';

@Injectable()
export class FilmsMongoRepository implements FilmsRepository {
  private readonly filmModel: Model<FilmDto>;

  constructor(@Inject(DATABASE_CONNECTION) connection: Connection) {
    this.filmModel = connection.model<FilmDto>('Film', FilmSchema, 'films');
  }

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmModel.find().lean<FilmDto[]>().exec();
    return films.map(toFilmDto);
  }

  async findScheduleByFilmId(id: string): Promise<ScheduleDto[] | null> {
    const film = await this.filmModel.findOne({ id }).lean<FilmDto>().exec();
    return film ? film.schedule.map(toScheduleDto) : null;
  }

  async findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleDto | null> {
    const schedule = await this.findScheduleByFilmId(filmId);
    return schedule?.find((session) => session.id === sessionId) ?? null;
  }

  async takeSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<boolean> {
    const result = await this.filmModel
      .updateOne(
        {
          id: filmId,
          schedule: { $elemMatch: { id: sessionId, taken: { $nin: seats } } },
        },
        { $push: { 'schedule.$.taken': { $each: seats } } },
      )
      .exec();
    return result.modifiedCount === 1;
  }

  async releaseSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<void> {
    await this.filmModel
      .updateOne(
        { id: filmId, 'schedule.id': sessionId },
        { $pullAll: { 'schedule.$.taken': seats } },
      )
      .exec();
  }
}
