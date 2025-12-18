import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from 'src/categories/entities/services.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
  ) {}

  async findAll() {
    return this.servicesRepository.find({
      where: { isActive: true },
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }
}
