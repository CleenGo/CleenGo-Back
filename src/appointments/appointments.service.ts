import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from 'src/user/entities/user.entity';
import { AppointmentStatus } from 'src/enum/appointmenStatus.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}
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

  async remove(id: string, authuser:string) {
    const appointment = await this.appointmentRepository.findOne({where: {id: id}});
    const user = await this.userRepository.findOne({where: {id: authuser}});
    if (!user) throw new BadRequestException('⚠️ User not found');
    if (!appointment) throw new BadRequestException('⚠️ Appointment not found');

    if(user.role === 'client' && appointment.clientId.id !== user.id) throw new BadRequestException('⚠️ You are not the owner of this appointment');
    else if(user.role === 'client'){
      appointment.status = AppointmentStatus.CANCELLED;
    }

    if(user.role === 'provider' && appointment.providerId.id !== user.id) throw new BadRequestException('⚠️ You are not the owner of this appointment');
    else if(user.role === 'provider'){
      appointment.status = AppointmentStatus.REJECTED;
    }
    return this.appointmentRepository.save(appointment);
  }
}
