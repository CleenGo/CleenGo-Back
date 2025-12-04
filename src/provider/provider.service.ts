
import { BadRequestException, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { RegisterProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository ,Like } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { Role } from 'src/enum/role.enum';
@Injectable()
export class ProviderService {

  constructor(@InjectRepository (Provider)
  private readonly serviceprovider :Repository<Provider>,

  //inyectar appoinments
){}

  async findAll() {
    return  this.serviceprovider.find({where: { isActive: true }  });
  }

  async findOne(id:string ) {
  const provider = await this.serviceprovider.findOne({
      where: { id },
      //relations:['category','schedule']
    });

    if (!provider|| provider.isActive === false) {
      throw new NotFoundException(`Service provider with ID ${id} not found`);
    }

    return provider;
  }


    async update(id: string, UpdateProviderDto: UpdateProviderDto) {
  const provider = await this.serviceprovider.findOne({ where: {  id } });

  if (!provider) {
    throw new NotFoundException(`El proveedor con id ${id} no existe`);
  }

  Object.assign(provider, UpdateProviderDto); 
  return await this.serviceprovider.save(provider);
}


async remove(id: string) {
  const provider = await this.serviceprovider.findOne({ where: {  id } });

  if (!provider) {
    throw new NotFoundException(`El proveedor con id ${id} no existe`);
  }
  provider.isActive = false;

  return await this.serviceprovider.save(provider);
}


/*     async dashboard(user){
    const provider = await this.serviceprovider.findOne({
      where: { userId: user.userId},
      relations:['category','schedule']
    });

    if (!provider || provider.isActive === false) {
      throw new NotFoundException(`Service provider not found`);
    }
    if (provider.rol != UserRole.provider) throw new BadRequestException('bad request');


    const confirmedAppointments = await this.appointmentRepository.count({
      where: { UserProvider: { userId: provider.userId }, Status: Status.CONFIRMED },
    });

    const pendingAppointments = await this.appointmentRepository.count({
      where: { UserProvider: { userId: provider.userId }, Status: Status.PENDING },
    });


    return { provider,confirmedAppointments, pendingAppointments };
  }
  async update(id: string, updateServiceproviderDto: UpdateServiceproviderDto) {
  const provider = await this.serviceprovider.findOne({ where: { userId: id } });

  if (!provider) {
    throw new NotFoundException(`El proveedor con id ${id} no existe`);
  }

  Object.assign(provider, updateServiceproviderDto); 
  return await this.serviceprovider.save(provider);
}
   */

/* 
  async search(name?: string, category?: string) {
    const where: any = {where: { isActive: true }};

    if (name) {
      // Busca proveedores cuyo nombre contenga la palabra ingresada
      where.name = Like(`%${name}%`);
    }

    if (category) {
      // Busca proveedores cuya categoría coincida con la ingresada
      where.category = { name: Like(`%${category}%`) };
    }

    return this.serviceprovider.find({
      where ,
      relations: ['category'], // trae categoría relacionada
      
    });
  }
 */

/*   
  async filterProviders(
  name?: string,
  category?: string,
  day?: string,
) {
  const query = this.serviceprovider
    .createQueryBuilder('provider')
    .where('provider.isActive = :isActive', { isActive: true })
    .leftJoinAndSelect('provider.category', 'category')
    .leftJoinAndSelect('provider.schedule', 'schedule');

  // Filtrar por nombre
  if (name) {
    query.andWhere('provider.name ILIKE :name', { name: `%${name}%` });
  }

  // Filtrar por categoría
  if (category) {
    query.andWhere('category.name ILIKE :category', { category: `%${category}%` });
  }

  // Filtrar por día disponible
  if (day) {
    // Asumiendo que schedule.days es un string tipo "lunes,martes"
    query.andWhere('schedule.days ILIKE :day', { day: `%${day}%` });
  }

  return await query.getMany();
} */

  async filterProviders(filters: {
  days?: string[];
  hours?: string[];
  services?: string[];
  rating?: number;
}) {
  const { days, hours, services, rating } = filters;

  const query = this.serviceprovider
    .createQueryBuilder('provider')
    .leftJoinAndSelect('provider.services', 'service')
    .leftJoinAndSelect('provider.suscription', 'suscription')
    .leftJoin('reviews', 'review', 'review.rated_id = provider.id')
    .where('provider.isActive = true');

  // ------------------------
  // FILTRO POR DIAS
  // ------------------------
  if (days && days.length > 0) {
    query.andWhere('provider.days && :days', { days });
    // operador && = array overlap (PostgreSQL)
  }

  // ------------------------
  // FILTRO POR HORARIOS
  // ------------------------
  if (hours && hours.length > 0) {
    query.andWhere('provider.hours && :hours', { hours });
  }

  // ------------------------
  // FILTRO POR SERVICIOS
  // ------------------------
  if (services && services.length > 0) {
    query.andWhere('service.id IN (:...services)', { services });
  }

  // ------------------------
  // FILTRO POR RATING PROMEDIO
  // ------------------------
  if (rating) {
    query
      .addSelect('AVG(review.rating)', 'avgRating')
      .groupBy('provider.id')
      .having('AVG(review.rating) >= :rating', { rating });
  }

  const providers = await query.getMany();

  return providers;
}

}
