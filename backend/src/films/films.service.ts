import { Injectable, NotFoundException } from '@nestjs/common';

import { ListResponseDto } from '../common/dto/list-response.dto';
import { FilmDto, ScheduleDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  async findAll(): Promise<ListResponseDto<FilmDto>> {
    return { total: 0, items: [] };
  }

  async findSchedule(id: string): Promise<ListResponseDto<ScheduleDto>> {
    throw new NotFoundException(`Фильм с id ${id} не найден`);
  }
}
