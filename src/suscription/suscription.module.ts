import { Module } from '@nestjs/common';
import { SuscriptionService } from './suscription.service';
import { SuscriptionController } from './suscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suscription } from './entities/suscription.entity';
import { Plan } from './entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Suscription, Plan])],
  controllers: [SuscriptionController],
  providers: [SuscriptionService],
  exports: [SuscriptionService],
})
export class SuscriptionModule {}
