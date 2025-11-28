import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Services } from './entities/services.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Services])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
