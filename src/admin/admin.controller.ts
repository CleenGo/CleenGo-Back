import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardCacheService } from 'src/Dashboard/dashboard-cache.service';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly dashboardCache: DashboardCacheService,
  ) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard,RolesGuard)  
  @Get('dashboard')
  async getDashboard() {
    // Buscar desde Redis
    const cachedData = await this.dashboardCache.getDashboardData();

    // Si no hay nada cacheado (ej: primer deploy), lo generamos manualmente
    if (!cachedData) {
      const data = await this.adminService.calculateDashboardStats();
      await this.dashboardCache.setDashboardData(data);
      return data;
    }

    return cachedData;
  }
}