import { Module } from '@nestjs/common';
import { SuscriptionPlanService } from './suscription-plan.service';
import { SuscriptionPlanController } from './suscription-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/suscription-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [SuscriptionPlanController],
  providers: [SuscriptionPlanService],
})
export class SuscriptionPlanModule {}
