import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { configureApp } from '../configure-app';
import { FilmDto, ScheduleDto } from './dto/films.dto';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

const schedule: ScheduleDto = {
  id: '5274c89d-f39c-40f9-bea8-f22a22a50c8a',
  daytime: '2024-06-28T10:00:53+03:00',
  hall: 0,
  rows: 5,
  seats: 10,
  price: 350,
  taken: ['1:1'],
};

const film: FilmDto = {
  id: '92b8a2a7-ab6b-4fa9-915b-d27945865e39',
  rating: 8.1,
  director: 'Амелия Хьюз',
  tags: ['Рекомендуемые'],
  title: 'Сон в летний день',
  about: 'Фэнтези-фильм',
  description: 'Причудливый фэнтези-фильм',
  image: '/bg6s.jpg',
  cover: '/bg6c.jpg',
  schedule: [schedule],
};

describe('FilmsController', () => {
  const filmsService = {
    findAll: jest.fn(),
    findSchedule: jest.fn(),
  };
  let controller: FilmsController;

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [{ provide: FilmsService, useValue: filmsService }],
    }).compile();

    controller = moduleRef.get(FilmsController);
  });

  describe('.getFilms()', () => {
    it('should return films list from the service', async () => {
      const films = { total: 1, items: [film] };
      filmsService.findAll.mockResolvedValue(films);

      await expect(controller.getFilms()).resolves.toEqual(films);
      expect(filmsService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('.getSchedule()', () => {
    it('should pass film id to the service and return its schedule', async () => {
      const sessions = { total: 1, items: [schedule] };
      filmsService.findSchedule.mockResolvedValue(sessions);

      await expect(controller.getSchedule(film.id)).resolves.toEqual(sessions);
      expect(filmsService.findSchedule).toHaveBeenCalledWith(film.id);
    });

    it('should rethrow NotFoundException from the service', async () => {
      filmsService.findSchedule.mockRejectedValue(new NotFoundException());

      await expect(controller.getSchedule('unknown')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('HTTP routes', () => {
    let app: INestApplication;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        controllers: [FilmsController],
        providers: [{ provide: FilmsService, useValue: filmsService }],
      }).compile();
      app = moduleRef.createNestApplication();
      configureApp(app);
      await app.init();
    });

    afterEach(async () => {
      await app.close();
    });

    it('GET /api/afisha/films should respond 200 with films list', async () => {
      filmsService.findAll.mockResolvedValue({ total: 1, items: [film] });

      const response = await request(app.getHttpServer())
        .get('/api/afisha/films')
        .expect(200);

      expect(response.body).toEqual({ total: 1, items: [film] });
    });

    it('GET /api/afisha/films/:id/schedule should respond 200 with schedule', async () => {
      filmsService.findSchedule.mockResolvedValue({
        total: 1,
        items: [schedule],
      });

      const response = await request(app.getHttpServer())
        .get(`/api/afisha/films/${film.id}/schedule`)
        .expect(200);

      expect(response.body).toEqual({ total: 1, items: [schedule] });
      expect(filmsService.findSchedule).toHaveBeenCalledWith(film.id);
    });

    it('GET /api/afisha/films/:id/schedule should respond 404 for unknown film', async () => {
      filmsService.findSchedule.mockRejectedValue(
        new NotFoundException({ error: 'Фильм не найден' }),
      );

      await request(app.getHttpServer())
        .get('/api/afisha/films/unknown/schedule')
        .expect(404, { error: 'Фильм не найден' });
    });
  });
});
