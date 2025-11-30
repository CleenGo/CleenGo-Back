import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { User } from 'src/user/entities/user.entity';
import { Service } from 'src/categories/entities/services.entity';
import { Suscription } from 'src/suscription/entities/suscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, User, Service, Suscription])],
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [TypeOrmModule],
})
export class ProviderModule {}
