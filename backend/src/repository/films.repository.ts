import { Inject, Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';

import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { DATABASE_CONNECTION } from './database.provider';
import { Film, FilmSchema } from './films.schema';

@Injectable()
export class FilmsRepository {
  private readonly filmModel: Model<Film>;

  constructor(@Inject(DATABASE_CONNECTION) connection: Connection) {
    this.filmModel = connection.model<Film>('Film', FilmSchema, 'films');
  }

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmModel.find().lean<Film[]>().exec();
    return films.map((film) => this.toFilmDto(film));
  }

  async findScheduleByFilmId(id: string): Promise<ScheduleDto[] | null> {
    const film = await this.filmModel.findOne({ id }).lean<Film>().exec();
    if (!film) {
      return null;
    }
    return film.schedule.map((session) => this.toScheduleDto(session));
  }

  private toFilmDto(film: Film): FilmDto {
    const {
      id,
      rating,
      director,
      tags,
      title,
      about,
      description,
      image,
      cover,
    } = film;
    return {
      id,
      rating,
      director,
      tags,
      title,
      about,
      description,
      image,
      cover,
    };
  }

  private toScheduleDto(session: ScheduleDto): ScheduleDto {
    const { id, daytime, hall, rows, seats, price, taken } = session;
    return { id, daytime, hall, rows, seats, price, taken };
  }
}
