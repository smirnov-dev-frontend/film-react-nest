import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { configureApp } from '../configure-app';
import { CreateOrderDto, OrderResultDto } from './dto/order.dto';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

const ticket = {
  film: '92b8a2a7-ab6b-4fa9-915b-d27945865e39',
  session: '5274c89d-f39c-40f9-bea8-f22a22a50c8a',
  daytime: '2024-06-28T10:00:53+03:00',
  row: 2,
  seat: 5,
  price: 350,
};

const order: CreateOrderDto = {
  email: 'test@test.ru',
  phone: '+7 (999) 999-99-99',
  tickets: [ticket],
};

const result: { total: number; items: OrderResultDto[] } = {
  total: 1,
  items: [{ ...ticket, id: 'c1e6a1a0-3b2f-4f1e-9a5b-2d6f0a8c9e11' }],
};

describe('OrderController', () => {
  const orderService = { create: jest.fn() };
  let controller: OrderController;

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: orderService }],
    }).compile();

    controller = moduleRef.get(OrderController);
  });

  describe('.createOrder()', () => {
    it('should pass order to the service and return created tickets', async () => {
      orderService.create.mockResolvedValue(result);

      await expect(controller.createOrder(order)).resolves.toEqual(result);
      expect(orderService.create).toHaveBeenCalledWith(order);
    });

    it('should rethrow BadRequestException when seat is already taken', async () => {
      orderService.create.mockRejectedValue(
        new BadRequestException({ error: 'Место 2:5 уже занято' }),
      );

      await expect(controller.createOrder(order)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('HTTP routes', () => {
    let app: INestApplication;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        controllers: [OrderController],
        providers: [{ provide: OrderService, useValue: orderService }],
      }).compile();
      app = moduleRef.createNestApplication();
      configureApp(app);
      await app.init();
    });

    afterEach(async () => {
      await app.close();
    });

    it('POST /api/afisha/order should respond 200 with created tickets', async () => {
      orderService.create.mockResolvedValue(result);

      await request(app.getHttpServer())
        .post('/api/afisha/order')
        .send(order)
        .expect(200, result);
    });

    it('POST /api/afisha/order should strip fields that are not in DTO', async () => {
      orderService.create.mockResolvedValue(result);

      await request(app.getHttpServer())
        .post('/api/afisha/order')
        .send({
          ...order,
          tickets: [{ ...ticket, day: '28 июня', time: '10:00' }],
        })
        .expect(200);

      expect(orderService.create).toHaveBeenCalledWith(order);
    });

    it('POST /api/afisha/order should respond 400 for invalid order without calling the service', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/afisha/order')
        .send({ email: 'not-an-email', phone: '', tickets: [] })
        .expect(400);

      expect(response.body.error).toEqual(expect.any(String));
      expect(orderService.create).not.toHaveBeenCalled();
    });

    it('POST /api/afisha/order should respond 400 when seat is already taken', async () => {
      orderService.create.mockRejectedValue(
        new BadRequestException({ error: 'Место 2:5 уже занято' }),
      );

      await request(app.getHttpServer())
        .post('/api/afisha/order')
        .send(order)
        .expect(400, { error: 'Место 2:5 уже занято' });
    });
  });
});
