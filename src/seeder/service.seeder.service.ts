import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from 'src/categories/entities/services.entity';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class ServiceSeedService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async seed() {
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
      // Limpieza
      { name: 'Barrer', unitaryPrice: 1500, category: limpieza },
      { name: 'Trapear', unitaryPrice: 1500, category: limpieza },
      { name: 'Sacudir muebles', unitaryPrice: 2000, category: limpieza },
      { name: 'Lavar vajilla', unitaryPrice: 1800, category: limpieza },
      { name: 'Lavar ropa', unitaryPrice: 2500, category: limpieza },
      { name: 'Tender camas', unitaryPrice: 1200, category: limpieza },

      // Jardinería
      { name: 'Cortar césped', unitaryPrice: 4000, category: jardineria },
      { name: 'Regar plantas', unitaryPrice: 1500, category: jardineria },
      { name: 'Podar árboles', unitaryPrice: 8000, category: jardineria },
    ];

    const created = this.serviceRepository.create(services);
    await this.serviceRepository.save(created);

    console.log('✔ Servicios iniciales creados');
  }
}
