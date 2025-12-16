// src/chat/entities/chat-message.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Usuario que ENVÍA el mensaje (puede ser client o provider)
  @ManyToOne(() => User, { eager: false, nullable: false })
  sender: User;

  // Usuario que RECIBE el mensaje
  @ManyToOne(() => User, { eager: false, nullable: false })
  receiver: User;

  // Cita a la que pertenece este chat
  @ManyToOne(() => Appointment, { eager: false, nullable: false })
  appointment: Appointment;

  // Contenido del mensaje
  @Column({ type: 'text' })
  content: string;

  // Si el mensaje ya fue leído por el receptor
  @Column({ default: false })
  read: boolean;

  // Fecha/hora en que se creó el mensaje (la pone la DB)
  @CreateDateColumn()
  createdAt: Date;
}
