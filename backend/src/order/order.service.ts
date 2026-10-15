import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { ListResponseDto } from '../common/dto/list-response.dto';
import { CreateOrderDto, OrderResultDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  async create(
    order: CreateOrderDto,
  ): Promise<ListResponseDto<OrderResultDto>> {
    const items = order.tickets.map((ticket) => ({
      ...ticket,
      id: randomUUID(),
    }));
    return { total: items.length, items };
  }
}
