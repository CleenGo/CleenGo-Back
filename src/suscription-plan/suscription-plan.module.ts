import { Module } from '@nestjs/common';
import { SuscriptionPlanService } from './suscription-plan.service';
import { SuscriptionPlanController } from './suscription-plan.controller';

@Module({
  controllers: [SuscriptionPlanController],
  providers: [SuscriptionPlanService],
})
export class SuscriptionPlanModule {}
