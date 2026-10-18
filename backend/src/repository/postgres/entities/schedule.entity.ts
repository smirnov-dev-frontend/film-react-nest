import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ScheduleDto } from '../../../films/dto/films.dto';
import { Film } from './film.entity';

@Entity('schedules')
export class Schedule implements ScheduleDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  daytime: string;

  @Column('integer')
  hall: number;

  @Column('integer')
  rows: number;

  @Column('integer')
  seats: number;

  @Column('double precision')
  price: number;

  @Column('simple-array')
  taken: string[];

  @Column('uuid')
  filmId: string;

  @ManyToOne(() => Film, (film) => film.schedule)
  @JoinColumn({ name: 'filmId' })
  film: Film;
}
