import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { Role } from 'src/enum/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { use } from 'passport';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ClientFilter } from './interfaces/client-filter';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getClientProfile(id: string): Promise<Omit<User, 'passwordUrl'>> {
    const user = await this.userRepository.findOne({
      where: {
        id,
        role: Role.CLIENT,
        isActive: true,
      },

      relations: ['clientAppointments', 'reviewsReceived'],
    });

    if (!user) throw new NotFoundException('Cliente no encontrado');

    const { passwordUrl, ...clientProfile } = user;

    return clientProfile;
  }

  async updateClientProfile(
    id: string,
    updateUserDto: UpdateUserProfileDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, role: Role.CLIENT, isActive: true },
    });

    if (!user) throw new NotFoundException('Cliente no encontrado');

    const safeFields = updateUserDto;

    Object.assign(user, safeFields);

    user.role = Role.CLIENT;

    const updatedUser = await this.userRepository.save(user);

    const { passwordUrl, ...clientProfile } = updatedUser;

    return clientProfile as User;
  }

  async getAllClients(page: number, limit: number, filters: ClientFilter) {
    if (page <= 0 || limit <= 0)
      throw new BadRequestException('Página y límite deben ser mayores a 0');

    const { name, email, isActive } = filters;

    const whereConditions: any = { role: Role.CLIENT };

    if (typeof isActive === 'boolean') {
      whereConditions.isActive = isActive;
    }

    if (name) {
      // ILIKE para búsqueda parcial e insensible a mayúsculas/minúsculas
      whereConditions.name = ILike(`%${name}%`);
    }

    if (email) {
      whereConditions.email = ILike(`%${email}%`);
    }

    const skip = (page - 1) * limit;

    const [clients, total] = await this.userRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order: { name: 'ASC' },
    });

    const safeClients = clients.map(
      ({ passwordUrl, ...clientList }) => clientList,
    );

    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      totalPages,
      clients: safeClients,
    };
  }

  async deleteClientProfile(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, role: Role.CLIENT, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('Cliente no encontrado o ya inactivo.');
    }

    user.isActive = false;

    const deletedUser = await this.userRepository.save(user);

    const { passwordUrl, ...safeUser } = deletedUser;

    return {
      message: 'Cuenta de cliente eliminada (desactivada) correctamente.',
      user: safeUser,
    };
  }
}
