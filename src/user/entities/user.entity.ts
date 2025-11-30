// src/user/entities/user.entity.ts
import { Role } from 'src/enum/role.enum';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
  OneToMany,
} from 'typeorm';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Review } from 'src/reviews/entities/review.entity';

@Entity({ name: 'users', schema: 'public' })
@TableInheritance({
  column: {
    type: 'varchar',
    name: 'user_type',
  },
})
export abstract class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  passwordUrl: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  profileImgUrl: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @Column({ type: 'int', default: 0 })
  rating: number;

  // Un usuario puede tener muchas citas como CLIENTE
  @OneToMany(() => Appointment, (appointment) => appointment.clientId)
  clientAppointments: Appointment[];

  // Un usuario puede TENER muchos reviews HECHOS por él
  @OneToMany(() => Review, (review) => review.userReviewer)
  reviewsMade: Review[];

  // Un usuario puede RECIBIR muchos reviews
  @OneToMany(() => Review, (review) => review.ratedUser)
  reviewsReceived: Review[];

  @Column({ default: true })
  isActive: boolean;
}
