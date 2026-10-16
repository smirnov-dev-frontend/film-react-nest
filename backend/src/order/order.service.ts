import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { ListResponseDto } from '../common/dto/list-response.dto';
import { ScheduleDto } from '../films/dto/films.dto';
import { FilmsRepository } from '../repository/films.repository';
import { CreateOrderDto, OrderResultDto, TicketDto } from './dto/order.dto';

interface SessionReservation {
  film: string;
  session: string;
  seats: string[];
}

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async create(
    order: CreateOrderDto,
  ): Promise<ListResponseDto<OrderResultDto>> {
    const tickets = order?.tickets;
    if (!Array.isArray(tickets) || tickets.length === 0) {
      throw new BadRequestException({ error: 'В заказе нет билетов' });
    }

    const sessions = new Map<string, ScheduleDto>();
    const reservations = new Map<string, SessionReservation>();
    const items: OrderResultDto[] = [];

    for (const ticket of tickets) {
      const key = `${ticket?.film}:${ticket?.session}`;
      if (!sessions.has(key)) {
        sessions.set(key, await this.getSession(ticket));
        reservations.set(key, {
          film: ticket.film,
          session: ticket.session,
          seats: [],
        });
      }
      const session = sessions.get(key);
      const reservation = reservations.get(key);
      const seat = this.getSeatKey(ticket, session);

      if (session.taken.includes(seat)) {
        throw new BadRequestException({ error: `Место ${seat} уже занято` });
      }
      if (reservation.seats.includes(seat)) {
        throw new BadRequestException({
          error: `Место ${seat} указано в заказе дважды`,
        });
      }
      reservation.seats.push(seat);

      items.push({
        id: randomUUID(),
        film: ticket.film,
        session: ticket.session,
        daytime: session.daytime,
        row: ticket.row,
        seat: ticket.seat,
        price: session.price,
      });
    }

    await this.reserve([...reservations.values()]);
    return { total: items.length, items };
  }

  private async getSession(ticket: TicketDto): Promise<ScheduleDto> {
    const session =
      typeof ticket?.film === 'string' && typeof ticket?.session === 'string'
        ? await this.filmsRepository.findSession(ticket.film, ticket.session)
        : null;
    if (!session) {
      throw new BadRequestException({ error: 'Сеанс не найден' });
    }
    return session;
  }

  private getSeatKey(ticket: TicketDto, session: ScheduleDto): string {
    const { row, seat } = ticket;
    const isValidRow = Number.isInteger(row) && row >= 1 && row <= session.rows;
    const isValidSeat =
      Number.isInteger(seat) && seat >= 1 && seat <= session.seats;
    if (!isValidRow || !isValidSeat) {
      throw new BadRequestException({
        error: `Места ${row}:${seat} нет в зале`,
      });
    }
    return `${row}:${seat}`;
  }

  private async reserve(reservations: SessionReservation[]): Promise<void> {
    const done: SessionReservation[] = [];
    for (const reservation of reservations) {
      const { film, session, seats } = reservation;
      const isTaken = await this.filmsRepository.takeSeats(
        film,
        session,
        seats,
      );
      if (!isTaken) {
        await Promise.all(
          done.map((item) =>
            this.filmsRepository.releaseSeats(
              item.film,
              item.session,
              item.seats,
            ),
          ),
        );
        throw new BadRequestException({ error: 'Места уже заняты' });
      }
      done.push(reservation);
    }
  }
}
