import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class CategorySeedService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async seed() {
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
}
