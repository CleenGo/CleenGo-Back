import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { DashboardCacheService } from 'src/Dashboard/dashboard-cache.service';
import { DashboardCronService } from 'src/Dashboard/dashboard-cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AdminController],
  providers: [AdminService, DashboardCronService, DashboardCacheService],
})
export class AdminModule {}
