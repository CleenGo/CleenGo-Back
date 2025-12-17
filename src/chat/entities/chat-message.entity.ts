// src/chat/entities/chat-message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false, nullable: false })
  sender: User;

  @ManyToOne(() => User, { eager: false, nullable: false })
  receiver: User;

  @ManyToOne(() => Appointment, { eager: false, nullable: false })
  appointment: Appointment;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  read: boolean;

  // ✅ GUARDAR CON TZ (UTC) PARA QUE SEA CONSISTENTE
  @CreateDateColumn({ type: 'timestamptz' })
  @Index()
  createdAt: Date;
}
