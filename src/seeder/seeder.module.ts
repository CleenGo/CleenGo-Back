import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from 'src/suscription-plan/entities/suscription-plan.entity';
import { SeedService } from './seeder.service';
import { Category } from 'src/categories/entities/category.entity';
// import { CategorySeedService } from './category.seeder.service';
import { Service } from 'src/categories/entities/services.entity';
// import { ServiceSeedService } from './service.seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Category, Service])],
  providers: [SeedService],
})
export class SeedModule {}
