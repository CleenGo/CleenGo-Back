import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Service } from 'src/categories/entities/services.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Provider,Category,Appointment, Service])],
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [TypeOrmModule],
})
export class ProviderModule {}
