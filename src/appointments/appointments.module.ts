import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from 'src/user/entities/user.entity';
import { Provider } from 'src/provider/entities/provider.entity';
import { Service } from 'src/categories/entities/services.entity';
import { NodemailerModule } from 'src/nodemailer/nodemailer.module';
import { AppointmentsCronService } from './AppointmentsCron.Service';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, User, Provider, Service]),
NodemailerModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsCronService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
