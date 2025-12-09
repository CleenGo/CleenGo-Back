import { Module } from '@nestjs/common';
import { SuscriptionService } from './suscription.service';
import { SuscriptionController } from './suscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suscription } from './entities/suscription.entity';
import { Plan } from 'src/suscription-plan/entities/suscription-plan.entity';
import { Provider } from 'src/provider/entities/provider.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Suscription, Plan, Provider,User])],
  controllers: [SuscriptionController],
  providers: [SuscriptionService],
  exports: [SuscriptionService],
})
export class SuscriptionModule {}
