import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from 'src/suscription-plan/entities/suscription-plan.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Service } from 'src/categories/entities/services.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedPlans();
    await this.seedCategory();
    await this.seedServices();
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
      price: 10, // ejemplo en dolares
      description: 'Mayor visibilidad y beneficios dentro de la aplicación',
      isActive: true,
    });

    await this.planRepository.save([basic, premium]);
    console.log('Planes iniciales creados');
  }

    async seedCategory() {
    const count = await this.categoryRepository.count();
    if (count > 0) return; // evitar duplicados

    const categories = [
      this.categoryRepository.create({
        name: 'Jardinería',
        isActive: true,
      }),
      this.categoryRepository.create({
        name: 'Limpieza',
        isActive: true,
      }),
    ];

    await this.categoryRepository.save(categories);
    console.log('✔ Categorías iniciales creadas');
  }

    async seedServices() {
    const count = await this.serviceRepository.count();
    
    if (count > 0) return; // evitar duplicados

    // Obtener las categorías
    const limpieza = await this.categoryRepository.findOne({
      where: { name: 'Limpieza' },
    });
    const jardineria = await this.categoryRepository.findOne({
      where: { name: 'Jardinería' },
    });

    if (!limpieza || !jardineria) {
      console.error('❌ Las categorías no fueron encontradas. Corre primero el seed de categorías.');
      return;
    }

    const services = [
  // =========================
  // LIMPIEZA – AIRBNB
  // =========================
  {
    name: 'Limpieza de mantenimiento (Check-out Airbnb)',
    unitaryPrice: 8000,
    category: limpieza,
  },
  {
    name: 'Limpieza profunda',
    unitaryPrice: 14000,
    category: limpieza,
  },
  {
    name: 'Limpieza integral / especial',
    unitaryPrice: 20000,
    category: limpieza,
  },

  // =========================
  // JARDINERÍA – AIRBNB
  // =========================
  {
    name: 'Mantenimiento básico de jardín',
    unitaryPrice: 6000,
    category: jardineria,
  },
  {
    name: 'Mantenimiento integral de jardín',
    unitaryPrice: 11000,
    category: jardineria,
  },
  {
    name: 'Puesta en valor / jardinería intensiva',
    unitaryPrice: 18000,
    category: jardineria,
  },
];

    const created = this.serviceRepository.create(services);
    await this.serviceRepository.save(created);

    console.log('✔ Servicios iniciales creados');
  }
}
