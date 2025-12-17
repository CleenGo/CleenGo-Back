//src/chat/chat.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { AppointmentsService } from 'src/appointments/appointments.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async createMessage(params: {
    appointmentId: string;
    senderId: string;
    content: string;
  }) {
    const { appointmentId, senderId } = params;
    const content = (params.content ?? '').trim();

    if (!content) {
      throw new BadRequestException('content no puede estar vacío');
    }

    const { clientId, providerId } =
      await this.appointmentsService.getParticipantsOrFail(appointmentId);

    const isClient = senderId === clientId;
    const isProvider = senderId === providerId;

    if (!isClient && !isProvider) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    const computedReceiverId = isClient ? providerId : clientId;

    if (!computedReceiverId) {
      throw new ForbiddenException(
        'Chat is not available for this appointment',
      );
    }

    const newMessage = this.chatMessageRepository.create({
      content,
      appointment: { id: appointmentId } as any,
      sender: { id: senderId } as any,
      receiver: { id: computedReceiverId } as any,
    });

    return this.chatMessageRepository.save(newMessage);
  }

  async getMessagesByAppointment(appointmentId: string) {
    return this.chatMessageRepository.find({
      where: { appointment: { id: appointmentId } },
      relations: {
        sender: true,
        receiver: true,
        appointment: true,
      },
      select: {
        id: true,
        content: true,
        read: true,
        createdAt: true,
        sender: {
          id: true,
          name: true,
          surname: true,
          profileImgUrl: true,
          role: true,
        },
        receiver: {
          id: true,
          name: true,
          surname: true,
          profileImgUrl: true,
          role: true,
        },
        appointment: {
          id: true,
        },
      },
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.chatMessageRepository.findOne({
      where: { id: messageId },
      relations: { receiver: true, appointment: true },
      select: {
        id: true,
        read: true,
        receiver: { id: true },
        appointment: { id: true },
      },
    });

    if (!message) throw new NotFoundException('El mensaje no existe');

    // ✅ valida que el user sea participante de ESA cita (y que cita esté activa/confirmada)
    const { clientId, providerId } =
      await this.appointmentsService.getParticipantsOrFail(
        message.appointment.id,
      );

    const isParticipant = userId === clientId || userId === providerId;
    if (!isParticipant) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este chat',
      );
    }

    // ✅ solo el receptor puede marcar como leído
    if (message.receiver.id !== userId) {
      throw new ForbiddenException(
        'Solo el receptor puede marcar el mensaje como leído',
      );
    }

    if (message.read)
      return { message: 'El mensaje ya estaba marcado como leído' };

    await this.chatMessageRepository.update({ id: messageId }, { read: true });
    return { message: 'Mensaje marcado como leído' };
  }

  // marcar todo como leído en una cita
  async markAllAsRead(appointmentId: string, userId: string) {
    // validar que el user sea participante de ESA cita (y que cita esté activa/confirmada)
    const { clientId, providerId } =
      await this.appointmentsService.getParticipantsOrFail(appointmentId);

    const isParticipant = userId === clientId || userId === providerId;
    if (!isParticipant) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este chat',
      );
    }

    const result = await this.chatMessageRepository
      .createQueryBuilder()
      .update(ChatMessage)
      .set({ read: true })
      .where('"appointmentId" = :appointmentId', { appointmentId })
      .andWhere('"receiverId" = :userId', { userId })
      .andWhere('"read" = false')
      .execute();

    const updatedCount = result.affected ?? 0;

    return {
      message: `Mensajes marcados como leídos: ${updatedCount}`,
      updatedCount,
    };
  }

  async getUnreadCount(userId: string) {
    const total = await this.chatMessageRepository.count({
      where: {
        receiver: { id: userId } as any,
        read: false,
      },
    });

    return { total };
  }

  async getUnreadSummary(userId: string) {
    const rows = await this.chatMessageRepository
      .createQueryBuilder('m')
      .innerJoin('m.sender', 'sender')
      .innerJoin('m.appointment', 'appointment')
      .where('m.receiverId = :userId', { userId })
      .andWhere('m.read = false')
      .select([
        'appointment.id AS appointmentId',
        'sender.id AS senderId',
        'sender.name AS senderName',
        'sender.surname AS senderSurname',
        'COUNT(m.id)::int AS count',
      ])
      .groupBy('appointment.id, sender.id')
      .getRawMany();

    return rows.map((r) => ({
      appointmentId: r.appointmentid,
      otherUser: {
        id: r.senderid,
        name: r.sendername,
        surname: r.sendersurname,
      },
      count: r.count,
    }));
  }
}
