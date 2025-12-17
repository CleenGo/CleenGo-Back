//Cleengo-Back/src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatParticipantGuard } from './guards/chat-participant.guard';
import { AppointmentsModule } from 'src/appointments/appointments.module';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage]),
    AppointmentsModule,
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatParticipantGuard, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
