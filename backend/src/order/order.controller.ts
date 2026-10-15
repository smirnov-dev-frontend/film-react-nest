import { Body, Controller, Post } from '@nestjs/common';

import { ListResponseDto } from '../common/dto/list-response.dto';
import { CreateOrderDto, OrderResultDto } from './dto/order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(
    @Body() order: CreateOrderDto,
  ): Promise<ListResponseDto<OrderResultDto>> {
    return this.orderService.create(order);
  }
}
