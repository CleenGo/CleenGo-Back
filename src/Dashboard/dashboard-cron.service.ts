import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdminService } from '../admin/admin.service';
import { DashboardCacheService } from './dashboard-cache.service';

@Injectable()
export class DashboardCronService {
  constructor(
    private readonly adminService: AdminService,
    private readonly dashboardCache: DashboardCacheService,
  ) {}

  // Corre cada 5 minutos
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleDashboardUpdate() {
    console.log('Cron: Actualizando dashboard...');

    // Llamamos al servicio que calcula las métricas reales
    const data = await this.adminService.calculateDashboardStats();

    // Guardamos en Redis
    await this.dashboardCache.setDashboardData(data);
    console.log('[CRON] Dashboard actualizado en Redis:', data);
  }
}
