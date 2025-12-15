import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatParticipantGuard } from './guards/chat-participant.guard';
import { AppointmentsModule } from 'src/appointments/appointments.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage]), AppointmentsModule],
  controllers: [ChatController],
  providers: [ChatService, ChatParticipantGuard],
  exports: [ChatService],
})
export class ChatModule {}
