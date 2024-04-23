import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rol } from './rol.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  rolId: number;
  @ManyToOne(() => Rol, (rol) => rol.users, {
    eager: true,
  })
  @JoinColumn({ name: 'rolId' })
  rol?: Rol;
}
