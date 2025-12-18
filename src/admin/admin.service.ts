import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';

import { Role } from 'src/enum/role.enum';
import { User } from 'src/user/entities/user.entity';
import { Provider } from 'src/provider/entities/provider.entity';
import { Suscription } from 'src/suscription/entities/suscription.entity';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,

    @InjectRepository(Suscription)
    private readonly suscriptionRepository: Repository<Suscription>,
  ) {}

  async calculateDashboardStats() {
    const totalClients = await this.userRepository.count({
      where: { role: Role.CLIENT },
    });

    const totalProviders = await this.userRepository.count({
      where: { role: Role.PROVIDER },
    });

    const totalUsers = totalClients + totalProviders;

    let ingresos = 0;

    const suscriptions = await this.suscriptionRepository.find({
      where: { paymentStatus: true },
      relations: ['plan'],
    });

    suscriptions.forEach((suscription) => {
      ingresos += Number(suscription.plan.price);
    });

    return {
      totalClients,
      totalProviders,
      totalUsers,
      ingresos,
    };
  }

  /**
   * Lista unificada de usuarios (client/provider/admin)
   * con paginación + filtros.
   */
  async getUsers(query: AdminUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.role) {
      where.role = query.role;
    } else {
      // por defecto, muestra client + provider (no admins) si no envían role
      where.role = In([Role.CLIENT, Role.PROVIDER]);
    }

    if (query.status) {
      where.isActive = query.status === 'active';
    }

    // helper para “enriquecer” providers con suscripción
    const attachProviderSuscriptions = async (rawUsers: any[]) => {
      const providerIds = rawUsers
        .filter((u) => u.role === Role.PROVIDER)
        .map((u) => u.id);

      if (!providerIds.length) return rawUsers;

      const suscriptions = await this.suscriptionRepository.find({
        where: {
          provider: { id: In(providerIds) },
        },
        relations: ['plan', 'provider'],
      });

      const map = new Map<string, Suscription>();
      suscriptions.forEach((s) => {
        if (s?.provider?.id) map.set(s.provider.id, s);
      });

      return rawUsers.map((u) => {
        if (u.role !== Role.PROVIDER) return u;
        return {
          ...u,
          suscription: map.get(u.id) ?? null,
        };
      });
    };

    // ======================
    // BÚSQUEDA (name OR email)
    // ======================
    if (query.search) {
      const base = { ...where };

      const whereArr = [
        { ...base, name: ILike(`%${query.search}%`) },
        { ...base, email: ILike(`%${query.search}%`) },
      ];

      const [users, total] = await this.userRepository.findAndCount({
        where: whereArr,
        skip,
        take: limit,
        order: { name: 'ASC' },
      });

      const safe = users.map(({ passwordUrl, ...u }) => u);
      const enriched = await attachProviderSuscriptions(safe);

      return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        users: enriched,
      };
    }

    // ======================
    // LISTA NORMAL
    // ======================
    const [users, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { name: 'ASC' },
    });

    const safe = users.map(({ passwordUrl, ...u }) => u);
    const enriched = await attachProviderSuscriptions(safe);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      users: enriched,
    };
  }

  /**
   * Detalle de usuario para admin.
   * - Si es CLIENT: trae appointments + reviewsReceived
   * - Si es PROVIDER: trae servicios + suscription(plan) + appointments
   */
  async getUserDetail(userId: string) {
    const baseUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!baseUser) throw new NotFoundException('Usuario no encontrado');

    if (baseUser.role === Role.CLIENT) {
      const client = await this.userRepository.findOne({
        where: { id: userId, role: Role.CLIENT },
        relations: ['clientAppointments', 'reviewsReceived'],
      });

      if (!client) throw new NotFoundException('Cliente no encontrado');

      const { passwordUrl, ...safe } = client;
      return safe;
    }

    if (baseUser.role === Role.PROVIDER) {
      const provider = await this.providerRepository.findOne({
        where: { id: userId },
        relations: [
          'services',
          'suscription',
          'suscription.plan',
          'appointments',
        ],
      });

      if (!provider) throw new NotFoundException('Proveedor no encontrado');

      const { passwordUrl, ...safe } = provider;
      return safe;
    }

    // ADMIN u otros
    const { passwordUrl, ...safe } = baseUser as any;
    return safe;
  }

  /**
   * Cambiar rol (hacer admin / cambiar a client/provider)
   * Reglas:
   * - No permitir que el admin se quite su propio rol admin
   */
  async updateUserRole(
    targetUserId: string,
    newRole: Role,
    requesterId: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: targetUserId },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Evitar auto-democión
    if (
      requesterId === targetUserId &&
      user.role === Role.ADMIN &&
      newRole !== Role.ADMIN
    ) {
      throw new ForbiddenException('No puedes quitarte tu propio rol ADMIN.');
    }

    user.role = newRole;

    const saved = await this.userRepository.save(user);
    const { passwordUrl, ...safe } = saved as any;
    return safe;
  }

  /**
   * Activar / desactivar (soft delete reversible)
   */
  async setUserActive(
    targetUserId: string,
    isActive: boolean,
    requesterId: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: targetUserId },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Evitar que el admin se desactive a sí mismo
    if (requesterId === targetUserId && isActive === false) {
      throw new ForbiddenException('No puedes desactivarte a ti mismo.');
    }

    user.isActive = isActive;

    const saved = await this.userRepository.save(user);
    const { passwordUrl, ...safe } = saved as any;

    return {
      message: isActive
        ? 'Usuario activado correctamente.'
        : 'Usuario desactivado correctamente.',
      user: safe,
    };
  }
}
