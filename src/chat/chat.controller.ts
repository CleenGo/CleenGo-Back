// src/chat/chat.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ChatParticipantGuard } from './guards/chat-participant.guard';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @UseGuards(JwtAuthGuard, ChatParticipantGuard)
  @ApiBearerAuth()
  async createMessage(@Body() body: CreateChatMessageDto, @Request() req: any) {
    const senderId = req.user.id;

    return this.chatService.createMessage({
      appointmentId: body.appointmentId,
      senderId,
      content: body.content,
    });
  }

  @Get('messages/:appointmentId')
  @UseGuards(JwtAuthGuard, ChatParticipantGuard)
  @ApiBearerAuth()
  async getMessagesByAppointment(
    @Param('appointmentId', new ParseUUIDPipe()) appointmentId: string,
  ) {
    return this.chatService.getMessagesByAppointment(appointmentId);
  }

  // marcar TODOS como leídos al abrir el chat
  @Patch('appointments/:appointmentId/read')
  @UseGuards(JwtAuthGuard, ChatParticipantGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Marcar como leídos todos los mensajes de una cita',
    description:
      'Marca como leídos todos los mensajes donde el usuario autenticado sea el receptor.',
  })
  @ApiParam({ name: 'appointmentId', type: String })
  async markAllAsRead(
    @Param('appointmentId', new ParseUUIDPipe()) appointmentId: string,
    @Request() req: any,
  ) {
    return this.chatService.markAllAsRead(appointmentId, req.user.id);
  }

  // (tu endpoint individual puede quedarse igual)
  @Patch('messages/:messageId/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async markAsRead(
    @Param('messageId', new ParseUUIDPipe()) messageId: string,
    @Request() req: any,
  ) {
    return this.chatService.markAsRead(messageId, req.user.id);
  }
}
