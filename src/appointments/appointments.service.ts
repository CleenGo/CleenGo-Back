import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentStatus } from 'src/enum/appointmenStatus.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async getParticipantsOrFail(appointmentId: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: { clientId: true, providerId: true },
      select: {
        id: true,
        status: true,
        isActive: true,
        clientId: { id: true },
        providerId: { id: true },
      },
    });

    if (!appointment) {
      throw new NotFoundException('La cita no existe');
    }

    if (!appointment.isActive) {
      throw new ForbiddenException('La cita no está activa');
    }

    if (appointment.status !== AppointmentStatus.CONFIRMEDPROVIDER) {
      throw new ForbiddenException(
        'El chat solo está disponible cuando la cita ha sido confirmada por el proveedor',
      );
    }

    return {
      clientId: appointment.clientId?.id,
      providerId: appointment.providerId?.id,
    };
  }

  create(createAppointmentDto: CreateAppointmentDto) {
    return 'This action adds a new appointment';
  }

  findAll() {
    return `This action returns all appointments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} appointment`;
  }

  update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return `This action updates a #${id} appointment`;
  }

  remove(id: number) {
    return `This action removes a #${id} appointment`;
  }
}
