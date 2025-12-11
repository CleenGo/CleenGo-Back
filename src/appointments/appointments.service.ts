import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from 'src/user/entities/user.entity';
import { AppointmentStatus } from 'src/enum/appointmenStatus.enum';
// import { FilterAppointmentDto } from './dto/filter-appointment.dto';
import { Role } from 'src/enum/role.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}
  // create(createAppointmentDto: CreateAppointmentDto) {
  //   return 'This action adds a new appointment';
  // }

  // async findAllUserAppointments(authUser:any, filters:filterAppointmentDto) {
  //   //busco el usuario autenticado
  //   const user = await this.userRepository.findOne({where: {id: authUser.sub}});
  //   if (!user) throw new BadRequestException('⚠️ User not found');

  //   console.log(filters);
  //   const query = this.appointmentRepository
  //     .createQueryBuilder('appointment')
  //     .leftJoinAndSelect('appointment.clientId', 'users')
  //     .leftJoinAndSelect('appointment.providerId', 'users')
  //     .leftJoinAndSelect('appointment.serviceId', 'service');

  //   if (authUser.rol === Role.CLIENT) {
  //     query.where('client.userId = :userId', { userId: user.id });
  //   } else if (authUser.rol === Role.PROVIDER) {
  //     query.where('provider.userId = :userId', { userId: user.id });
  //   }
  //   if (filters.status) {
  //     query.andWhere('appointment.Status = :status', {
  //       status: filters.status,
  //     });
  //   }

  //   if (filters.category) {
  //     query.andWhere('category.Name = :category', {
  //       category: filters.category,
  //     });
  //   }

  //   if (filters.providerId) {
  //     query.andWhere('provider.Name = :provider', {
  //       provider: filters.provider,
  //     });
  //   }

  //   query.orderBy('appointment.AppointmentDate', 'DESC');

  //   const appointments: Appointment[] = await query.getMany();

    
  
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} appointment`;
  // }

  // async update(id: string, updateAppointmentDto: UpdateAppointmentDto, idAuthUser:string) {

  
  //   ;
  // }

  // async updateStatus(id: string, status: string) {
  //     //traigo el appointment en cuestion y el usuario autenticado
  //   const appointment = await this.appointmentRepository.findOne({where: {id: id}});

  //   const user = await this.userRepository.findOne({where: {id: idAuthUser}});
  //   if (!user) throw new BadRequestException('⚠️ User not found');
  //   if (!appointment) throw new BadRequestException('⚠️ Appointment not found');

  //   if(user.role === 'client' && appointment.clientId.id !== user.id) throw new BadRequestException('⚠️ You are not the owner of this appointment');
  //   else if(user.role === 'client'){
  //     if(appointment.status === AppointmentStatus.CONFIRMEDPROVIDER || appointment.status === AppointmentStatus.COMPLETED) throw new BadRequestException('⚠️ You can not cancel this appointment');
  //     appointment.status = AppointmentStatus.CANCELLED;
  //   }

  //   if(user.role === 'provider' && appointment.providerId.id !== user.id) throw new BadRequestException('⚠️ You are not the owner of this appointment');
  //   else if(user.role === 'provider'){
  //     appointment.status = AppointmentStatus.REJECTED;
  //   }
  //   return this.appointmentRepository.save(appointment);


   
  //   appointment.status = status;
  //   return this.appointmentRepository.save(appointment);
  // }

  // async remove(id: string, authuser:string) {

  //   //traigo el appointment en cuestion y el usuario autenticado
  //   const appointment = await this.appointmentRepository.findOne({where: {id: id}});

  //   const user = await this.userRepository.findOne({where: {id: authuser}});
  //   if (!user) throw new BadRequestException('⚠️ User not found');
  //   if (!appointment) throw new BadRequestException('⚠️ Appointment not found');

  //   if(user.role === 'client' && appointment.clientId.id !== user.id) throw new BadRequestException('⚠️ You are not the owner of this appointment');
  //   if(user.role === 'provider' && appointment.providerId.id !== user.id) throw new BadRequestException('⚠️ You are not the owner of this appointment');

  

  //   return this.appointmentRepository.update(id, {isActive: false});
  

  // }
}
