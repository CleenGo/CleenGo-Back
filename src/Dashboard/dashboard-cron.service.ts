import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdminService } from '../admin/admin.service';
import { DashboardCacheService } from './dashboard-cache.service';

@Injectable()
export class DashboardCronService {
  private readonly logger = new Logger(DashboardCronService.name);

  constructor(
    private readonly adminService: AdminService,
    private readonly dashboardCache: DashboardCacheService,
  ) {}

  // Corre cada 5 minutos
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleDashboardUpdate() {
    try {
      this.logger.log('Cron: Actualizando dashboard...');

      // Llamamos al servicio que calcula las métricas reales
      const data = await this.adminService.calculateDashboardStats();

      // Guardamos en Redis
      await this.dashboardCache.setDashboardData(data);

      this.logger.log(
        `[CRON] Dashboard actualizado en Redis: ${JSON.stringify(data)}`,
      );
    } catch (error: any) {
      // ⛑️ No re-lanzamos el error: así no “ensuciamos” el scheduler
      this.logger.error(
        `[CRON] Error actualizando dashboard: ${error?.message}`,
        error?.stack,
      );
    }
  }
}
