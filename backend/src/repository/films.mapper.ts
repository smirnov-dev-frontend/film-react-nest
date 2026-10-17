import { FilmDto, ScheduleDto } from '../films/dto/films.dto';

export const toScheduleDto = (session: ScheduleDto): ScheduleDto => {
  const { id, daytime, hall, rows, seats, price, taken } = session;
  return { id, daytime, hall, rows, seats, price, taken };
};

export const toFilmDto = (film: FilmDto): FilmDto => {
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
    schedule,
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
    schedule: schedule.map(toScheduleDto),
  };
};
