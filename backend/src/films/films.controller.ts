import { Controller, Get, Param } from '@nestjs/common';

import { ListResponseDto } from '../common/dto/list-response.dto';
import { FilmDto, ScheduleDto } from './dto/films.dto';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  getFilms(): Promise<ListResponseDto<FilmDto>> {
    return this.filmsService.findAll();
  }

  @Get(':id/schedule')
  getSchedule(@Param('id') id: string): Promise<ListResponseDto<ScheduleDto>> {
    return this.filmsService.findSchedule(id);
  }
}
