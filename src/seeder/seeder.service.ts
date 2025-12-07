import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from 'src/suscription-plan/entities/suscription-plan.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedPlans();
  }

  private async seedPlans() {
    const exists = await this.planRepository.count();
    if (exists > 0) return; // para no duplicar

    const basic = this.planRepository.create({
      name: 'Gratuito',
      price: 0,
      description: 'Acceso gratuito a la aplicación',
      isActive: true,
    });

    const premium = this.planRepository.create({
      name: 'Premium',
      price: 2999, // ejemplo en pesos Argentinos
      description: 'Mayor visibilidad y beneficios dentro de la aplicación',
      isActive: true,
    });

    await this.planRepository.save([basic, premium]);
    console.log('Planes iniciales creados');
  }
}
