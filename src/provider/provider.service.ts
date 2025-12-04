
import { BadRequestException, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { RegisterProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository ,Like } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { Role } from 'src/enum/role.enum';
import { Review } from 'src/reviews/entities/review.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
@Injectable()
export class ProviderService {

  constructor(@InjectRepository (Provider)
  private readonly serviceprovider :Repository<Provider>,

  @InjectRepository(Appointment)
  private readonly appoimentService :Repository<Appointment>

  
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


async filterProviders(filters: { day?: string; hour?: string }) {
  const { day, hour } = filters;
  
  const query = this.serviceprovider
    .createQueryBuilder('provider')
    .where('provider.isActive = :active', { active: true });

  if (day) {
    query.andWhere(':day = ANY(provider.days)', { day });
  }

  if (hour) {
    query.andWhere(':hour = ANY(provider.hours)', { hour });
  }

  return query.getMany();
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
/* async filterProviders(filters: {
  days?: string[];
  hours?: string[];
  agendaDays?: string[];
  rating?: number;
}) {
  const { days, hours, agendaDays, rating } = filters;

  const query = this.serviceprovider
    .createQueryBuilder('provider')
    .leftJoinAndSelect('provider.services', 'service')
    .leftJoinAndSelect('provider.schedule', 'schedule')
    .leftJoin(Review, 'review', 'review.rated_id = provider.id')
    .where('provider.isActive = true');

  // ----------------------------
  // FILTRO POR DÍAS QUE TRABAJA
  // ----------------------------
  if (days?.length) {
    query.andWhere('provider.days && ARRAY[:...days]::text[]', { days });
  }

  // ----------------------------
  // FILTRO POR HORARIOS QUE TRABAJA
  // ----------------------------
  if (hours?.length) {
    query.andWhere('provider.hours && ARRAY[:...hours]::text[]', { hours });
  }

  // ----------------------------
  // FILTRO POR DÍAS DISPONIBLES EN LA AGENDA
  // ----------------------------
  if (agendaDays?.length) {
    query.andWhere('provider.agendaDays && ARRAY[:...agendaDays]::text[]', {
      agendaDays,
    });
  }

  // ----------------------------
  // FILTRO POR RATING
  // ----------------------------
  if (rating) {
    query
      .addSelect('AVG(review.rating)', 'avgRating')
      .groupBy('provider.id')
      .having('COALESCE(AVG(review.rating), 0) >= :rating', { rating });
    // COALESCE permite incluir providers sin reviews tratándolos como rating = 0
  }

  return await query.getMany();
} */


/* async filterProviders(filters: {
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
    .leftJoin(Review, 'review', 'review.rated_id = provider.id')
    .where('provider.isActive = true');

  // --------- DIAS ----------
  if (days?.length) {
    query.andWhere('provider.days && ARRAY[:...days]::text[]', { days });
  }

  // --------- HORARIOS ----------
  if (hours?.length) {
    query.andWhere('provider.hours && ARRAY[:...hours]::text[]', { hours });
  }

  // --------- SERVICIOS ----------
  if (services?.length) {
    query.andWhere('service.id IN (:...services)', { services });
  }

  // --------- RATING ----------
  if (rating) {
    query
      .addSelect('AVG(review.rating)', 'avgRating')
      .groupBy('provider.id')
      .having('AVG(review.rating) >= :rating', { rating });
  }

  return query.getMany();
}
 */


}
