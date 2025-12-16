// Cleengo-Back/src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { AppointmentsService } from 'src/appointments/appointments.service';

type WsUser = {
  id: string;
  email: string;
  role: string;
};

// userId -> set(socketId) ✅ evita falso offline con múltiples tabs
const onlineUsers = new Map<string, Set<string>>();

// appointmentId -> { clientId, providerId } ✅ cache para emitir presence rápido
const appointmentParticipants = new Map<
  string,
  { clientId: string; providerId: string }
>();

function addOnline(userId: string, socketId: string) {
  const set = onlineUsers.get(userId) ?? new Set<string>();
  const wasOffline = set.size === 0;
  set.add(socketId);
  onlineUsers.set(userId, set);
  return wasOffline;
}

function removeOnline(userId: string, socketId: string) {
  const set = onlineUsers.get(userId);
  if (!set) return { becameOffline: false };

  set.delete(socketId);
  const becameOffline = set.size === 0;

  if (becameOffline) onlineUsers.delete(userId);
  else onlineUsers.set(userId, set);

  return { becameOffline };
}

function isUserOnline(userId: string) {
  return onlineUsers.has(userId);
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONT_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  // =========================
  // ✅ Presence helpers
  // =========================
  private emitPresenceToRoom(appointmentId: string) {
    const p = appointmentParticipants.get(appointmentId);
    if (!p) return;

    const onlineUserIds = [p.clientId, p.providerId].filter((id) =>
      isUserOnline(id),
    );

    this.server.to(`appointment-${appointmentId}`).emit('presence', {
      appointmentId,
      onlineUserIds,
    });
  }

  private emitPresenceForAllAppointmentsOfUser(userId: string) {
    for (const [appointmentId, p] of appointmentParticipants.entries()) {
      if (p.clientId === userId || p.providerId === userId) {
        this.emitPresenceToRoom(appointmentId);
      }
    }
  }

  // =========================
  // ✅ Navbar unread helper (room por usuario)
  // =========================
  private async emitUnreadSummaryToUser(userId: string) {
    try {
      const summary = await this.chatService.getUnreadSummary(userId);
      const total = (summary ?? []).reduce(
        (acc: number, x: any) => acc + Number(x?.count ?? 0),
        0,
      );

      this.server.to(`user-${userId}`).emit('unreadSummaryUpdated', {
        userId,
        summary,
        total,
        at: new Date().toISOString(),
      });
    } catch (e) {
      // no tumbamos el WS por falla de DB momentánea
      console.warn('emitUnreadSummaryToUser error', e);
    }
  }

  // =====================================================
  // 🔐 AUTENTICACIÓN SOCKET
  // =====================================================
  async handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      (client.handshake.headers?.authorization as string | undefined)?.replace(
        /^Bearer\s+/i,
        '',
      );

    if (!token) {
      console.warn('❌ WS rechazado: token no enviado');
      client.disconnect();
      return;
    }

    try {
      const payload: any = this.jwtService.verify(token);

      if (!payload?.sub || !payload?.email || !payload?.role) {
        console.warn('❌ WS rechazado: payload inválido');
        client.disconnect();
        return;
      }

      const wsUser: WsUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      client.data.user = wsUser;

      // ✅ room por usuario (para Navbar realtime)
      client.join(`user-${wsUser.id}`);

      const wasOffline = addOnline(wsUser.id, client.id);

      // Global presence
      if (wasOffline) this.server.emit('userOnline', { userId: wsUser.id });

      // refrescar presence de rooms donde participa
      this.emitPresenceForAllAppointmentsOfUser(wsUser.id);

      // ✅ snapshot de unread al conectar (opcional pero muy útil)
      await this.emitUnreadSummaryToUser(wsUser.id);

      console.log(`🔌 WS conectado: ${wsUser.email}`);
    } catch (error: any) {
      console.warn(
        error?.name === 'TokenExpiredError'
          ? '⏱️ WS token expirado'
          : '❌ WS token inválido',
      );
      client.disconnect();
    }
  }

  // =====================================================
  // 🔴 DESCONEXIÓN
  // =====================================================
  handleDisconnect(client: Socket) {
    const user: WsUser | undefined = client.data?.user;

    if (user?.id) {
      const { becameOffline } = removeOnline(user.id, client.id);

      if (becameOffline) this.server.emit('userOffline', { userId: user.id });

      // refrescar presence de rooms donde participa
      this.emitPresenceForAllAppointmentsOfUser(user.id);
    }

    console.log(`🔌 WS desconectado: ${user?.email ?? 'desconocido'}`);
  }

  // =====================================================
  // 📌 JOIN ROOM + presence snapshot
  // =====================================================
  @SubscribeMessage('joinAppointment')
  async joinAppointment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { appointmentId: string },
  ) {
    const user: WsUser | undefined = client.data.user;
    if (!user) throw new WsException('No autenticado');

    const appointmentId = String(data?.appointmentId || '').trim();
    if (!appointmentId) throw new WsException('appointmentId requerido');

    const { clientId, providerId } =
      await this.appointmentsService.getParticipantsOrFail(appointmentId);

    const isParticipant = user.id === clientId || user.id === providerId;
    if (!isParticipant)
      throw new WsException('No eres participante de esta cita');

    // cache participants para presence updates
    appointmentParticipants.set(appointmentId, { clientId, providerId });

    const room = `appointment-${appointmentId}`;
    client.join(room);

    // snapshot inmediato para todos en el room
    this.emitPresenceToRoom(appointmentId);

    // ✅ snapshot unread al entrar al chat (opcional)
    await this.emitUnreadSummaryToUser(user.id);

    console.log(`📥 ${user.email} se unió al room ${room}`);
  }

  // =====================================================
  // 💬 ENVIAR MENSAJE
  // =====================================================
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { appointmentId: string; content: string },
  ) {
    const user: WsUser | undefined = client.data.user;
    if (!user) throw new WsException('No autenticado');

    const appointmentId = String(data?.appointmentId || '').trim();
    const content = String(data?.content || '').trim();

    if (!appointmentId) throw new WsException('appointmentId requerido');
    if (!content) throw new WsException('content no puede estar vacío');

    const message = await this.chatService.createMessage({
      appointmentId,
      senderId: user.id,
      content,
    });

    // chat realtime en room de appointment
    this.server.to(`appointment-${appointmentId}`).emit('newMessage', message);

    // ✅ Navbar realtime: subir unread del receptor
    const receiverId = message?.receiver?.id;
    if (receiverId) {
      await this.emitUnreadSummaryToUser(receiverId);
    }

    client.emit('messageDelivered', {
      messageId: message.id,
      appointmentId,
    });

    return message;
  }

  // =====================================================
  // 👀 MARCAR TODO COMO LEÍDO
  // =====================================================
  @SubscribeMessage('markRead')
  async markRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { appointmentId: string },
  ) {
    const user: WsUser | undefined = client.data.user;
    if (!user) throw new WsException('No autenticado');

    const appointmentId = String(data?.appointmentId || '').trim();
    if (!appointmentId) throw new WsException('appointmentId requerido');

    const result = await this.chatService.markAllAsRead(appointmentId, user.id);

    this.server.to(`appointment-${appointmentId}`).emit('messagesRead', {
      appointmentId,
      readerId: user.id,
      updatedCount: result.updatedCount ?? 0,
      at: new Date().toISOString(),
    });

    // ✅ Navbar realtime: bajar unread del que leyó
    await this.emitUnreadSummaryToUser(user.id);

    return result;
  }

  // =====================================================
  // ✍️ ESCRIBIENDO...
  // =====================================================
  @SubscribeMessage('typing')
  typing(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { appointmentId: string },
  ) {
    const user: WsUser | undefined = client.data.user;
    if (!user) throw new WsException('No autenticado');

    const appointmentId = String(data?.appointmentId || '').trim();
    if (!appointmentId) return;

    client
      .to(`appointment-${appointmentId}`)
      .emit('typing', { userId: user.id });
  }

  // =====================================================
  // 🛑 STOP TYPING
  // =====================================================
  @SubscribeMessage('stopTyping')
  stopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { appointmentId: string },
  ) {
    const user: WsUser | undefined = client.data.user;
    if (!user) throw new WsException('No autenticado');

    const appointmentId = String(data?.appointmentId || '').trim();
    if (!appointmentId) return;

    client
      .to(`appointment-${appointmentId}`)
      .emit('stopTyping', { userId: user.id });
  }
}
