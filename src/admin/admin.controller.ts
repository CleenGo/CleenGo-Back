import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardCacheService } from 'src/Dashboard/dashboard-cache.service';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { ToggleUserActiveDto } from './dto/toggle-user-active.dto';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly dashboardCache: DashboardCacheService,
  ) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('dashboard')
  async getDashboard() {
    const cachedData = await this.dashboardCache.getDashboardData();

    if (!cachedData) {
      const data = await this.adminService.calculateDashboardStats();
      await this.dashboardCache.setDashboardData(data);
      return data;
    }

    return cachedData;
  }

  // ✅ Lista unificada de usuarios (client/provider/admin)
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('users')
  getUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  // ✅ Detalle por usuario
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('users/:id')
  getUserDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getUserDetail(id);
  }

  // ✅ Cambiar rol (hacer admin, etc.)
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('users/:id/role')
  updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.updateUserRole(id, dto.role as Role, req.user.id);
  }

  // ✅ Activar / Desactivar usuario (soft reversible)
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('users/:id/active')
  setUserActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleUserActiveDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.setUserActive(id, dto.isActive, req.user.id);
  }
}
