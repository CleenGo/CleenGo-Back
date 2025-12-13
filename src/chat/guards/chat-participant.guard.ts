import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AppointmentsService } from 'src/appointments/appointments.service';

@Injectable()
export class ChatParticipantGuard implements CanActivate {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const userId: string | undefined = req.user?.id;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    // appointmentId puede venir por GET param o por POST body
    const appointmentId: string | undefined =
      req.params?.appointmentId ?? req.body?.appointmentId;

    if (!appointmentId) {
      throw new ForbiddenException('appointmentId is required');
    }

    const { clientId, providerId } =
      await this.appointmentsService.getParticipantsOrFail(appointmentId);

    const isParticipant = userId === clientId || userId === providerId;
    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not allowed to access this chat (not a participant)',
      );
    }

    // (Opcional útil) dejamos “cacheado” para el controller/service
    req.chatParticipants = { clientId, providerId, appointmentId };

    return true;
  }
}
