import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { Role } from 'src/enum/role.enum';
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

    if (!user) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const {
      name,
      surname,
      birthDate,
      profileImgUrl,
      phone,
      street,
      exteriorNumber,
      interiorNumber,
      neighborhood,
      city,
      state,
      postalCode,
      fullAddress,
      latitude,
      longitude,
    } = updateUserDto;

    if (name !== undefined) user.name = name;
    if (surname !== undefined) user.surname = surname;
    if (birthDate !== undefined) user.birthDate = birthDate;
    if (profileImgUrl !== undefined) user.profileImgUrl = profileImgUrl;
    if (phone !== undefined) user.phone = phone;

    if (street !== undefined) user.street = street;
    if (exteriorNumber !== undefined) user.exteriorNumber = exteriorNumber;
    if (interiorNumber !== undefined) user.interiorNumber = interiorNumber;
    if (neighborhood !== undefined) user.neighborhood = neighborhood;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (postalCode !== undefined) user.postalCode = postalCode;

    if (fullAddress !== undefined && fullAddress !== null) {
      user.fullAddress = fullAddress;
    } else {
      const parts = [
        street ?? user.street,
        exteriorNumber ?? user.exteriorNumber,
        neighborhood ?? user.neighborhood,
        city ?? user.city,
        state ?? user.state,
        postalCode ?? user.postalCode,
      ].filter(Boolean);

      if (parts.length > 0) {
        user.fullAddress = parts.join(', ');
      }
    }

    if (latitude !== undefined) user.latitude = latitude;
    if (longitude !== undefined) user.longitude = longitude;

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
