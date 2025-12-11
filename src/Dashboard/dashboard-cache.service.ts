import { Injectable, Inject } from '@nestjs/common';
// import { Redis } from 'ioredis';

@Injectable()
export class DashboardCacheService {
  private readonly DASHBOARD_KEY = 'admin_dashboard_data';

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: any,
  ) {}

  async setDashboardData(data: any) {
    await this.redisClient.set(
      this.DASHBOARD_KEY,
      JSON.stringify(data),
      'EX',
      300, // expira en 5min
    );
  }

  async getDashboardData() {
    const result = await this.redisClient.get(this.DASHBOARD_KEY);
    return result ? JSON.parse(result) : null;
  }
}

