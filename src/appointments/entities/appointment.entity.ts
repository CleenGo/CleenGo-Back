import { Service } from 'src/categories/entities/services.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AppointmentStatus } from '../../enum/appointmenStatus.enum';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  clientId: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'provider_id' })
  providerId: User;



  @ManyToOne(() => Service)
  @JoinColumn({name: 'services_id'})
  services: Service;

  @Column({type: 'text', nullable: true})
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  addressUrl: string;

  @Column({
    type: 'date',
    nullable: false,
  })
  date: Date;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  startHour: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  endHour: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
