import { Module } from '@nestjs/common';
import { DashboardCacheService } from './dashboard-cache.service';
import { RedisModule } from 'src/redis/redis-cache.module';

@Module({
  imports: [RedisModule],
  providers: [DashboardCacheService],
  exports: [DashboardCacheService],
})
export class DashboardCacheModule {}
