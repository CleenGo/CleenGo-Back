import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Service } from 'src/categories/entities/services.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async findAll() {
    return this.providerRepository.find({
      where: { isActive: true },
      relations: ['services'], // ✅ SOLO relations que existen
    });
  }

  async findOne(id: string) {
    const provider = await this.providerRepository.findOne({
      where: { id, isActive: true },
      relations: ['services'], // ✅ SOLO relations que existen
    });

    if (!provider) {
      throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
    }

    return provider;
  }

  async update(id: string, dto: UpdateProviderDto) {
    const provider = await this.providerRepository.findOne({
      where: { id },
      relations: ['services'],
    });

    if (!provider) {
      throw new NotFoundException(`Proveedor con id ${id} no existe`);
    }

    const { services, ...providerData } = dto;
    Object.assign(provider, providerData);

    if (services !== undefined) {
      if (!Array.isArray(services)) {
        throw new BadRequestException('services debe ser un arreglo');
      }

      const areUUIDs = services.every((s) => isUUID(s));

      const serviceEntities = areUUIDs
        ? await this.serviceRepository.findBy({ id: In(services) })
        : await this.serviceRepository.findBy({ name: In(services) });

      provider.services = serviceEntities;
    }

    await this.providerRepository.save(provider);

    // ✅ Devuelve el provider actualizado con services
    return this.providerRepository.findOne({
      where: { id },
      relations: ['services'],
    });
  }

  async remove(id: string) {
    const provider = await this.providerRepository.findOne({ where: { id } });

    if (!provider) {
      throw new NotFoundException(`Proveedor con id ${id} no existe`);
    }

    provider.isActive = false;
    return this.providerRepository.save(provider);
  }

  async filterProviders(filters: {
    day?: string;
    hour?: string;
    services?: string;
  }) {
    const { day, hour, services } = filters;

    const query = this.providerRepository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.services', 'service')
      .where('provider.isActive = true')
      .distinct(true);

    if (day) query.andWhere(':day = ANY(provider.days)', { day });
    if (hour) query.andWhere(':hour = ANY(provider.hours)', { hour });

    if (services) {
      query.andWhere('service.name ILIKE :service', {
        service: `%${services}%`,
      });
    }

    return query.getMany();
  }
}
