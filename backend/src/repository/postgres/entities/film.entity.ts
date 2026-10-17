import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { FilmDto } from '../../../films/dto/films.dto';
import { Schedule } from './schedule.entity';

@Entity('films')
export class Film implements FilmDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('double precision')
  rating: number;

  @Column('varchar')
  director: string;

  @Column('simple-array')
  tags: string[];

  @Column('varchar')
  image: string;

  @Column('varchar')
  cover: string;

  @Column('varchar')
  title: string;

  @Column('varchar')
  about: string;

  @Column('varchar')
  description: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film)
  schedule: Schedule[];
}
