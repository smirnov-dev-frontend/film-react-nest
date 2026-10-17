import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { FilmDto, ScheduleDto } from '../../films/dto/films.dto';
import { toFilmDto, toScheduleDto } from '../films.mapper';
import { FilmsRepository } from '../films.repository';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';

@Injectable()
export class FilmsPostgresRepository implements FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmRepository.find({
      relations: { schedule: true },
      order: { schedule: { daytime: 'ASC' } },
    });
    return films.map(toFilmDto);
  }

  async findScheduleByFilmId(id: string): Promise<ScheduleDto[] | null> {
    if (!isUUID(id)) {
      return null;
    }
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: { schedule: true },
      order: { schedule: { daytime: 'ASC' } },
    });
    return film ? film.schedule.map(toScheduleDto) : null;
  }

  async findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleDto | null> {
    if (!isUUID(filmId) || !isUUID(sessionId)) {
      return null;
    }
    const session = await this.scheduleRepository.findOneBy({
      id: sessionId,
      filmId,
    });
    return session ? toScheduleDto(session) : null;
  }

  takeSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const session = await this.lockSession(manager, filmId, sessionId);
      if (!session || seats.some((seat) => session.taken.includes(seat))) {
        return false;
      }
      await manager.update(Schedule, session.id, {
        taken: [...session.taken, ...seats],
      });
      return true;
    });
  }

  async releaseSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const session = await this.lockSession(manager, filmId, sessionId);
      if (!session) {
        return;
      }
      await manager.update(Schedule, session.id, {
        taken: session.taken.filter((seat) => !seats.includes(seat)),
      });
    });
  }

  private lockSession(
    manager: EntityManager,
    filmId: string,
    sessionId: string,
  ): Promise<Schedule | null> {
    return manager.findOne(Schedule, {
      where: { id: sessionId, filmId },
      lock: { mode: 'pessimistic_write' },
    });
  }
}
