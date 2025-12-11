import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/enum/role.enum';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Provider } from 'src/provider/entities/provider.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) 
    private readonly userRepository: Repository<User>,
  ){}

  //voy a agregar mas adelante
  //  providersBySubscription: [
  //   { subscriptionId: 'uuid', subscriptionName: 'Premium', count: 42 },
  //   ...
  // ],
  // Ingresos: number,
  // appointments: {
  //   total: number,
  //   pending: number,
  //   accepted: number,
  //   rejected: number
  // }

  async calculateDashboardStats() {
  const totalClients = await this.userRepository.count({ where: { role: Role.CLIENT } });
  const totalProviders = await this.userRepository.count({ where: { role: Role.PROVIDER } });
  const totalUsers = await this.userRepository.count();

  const userProviders = await this.userRepository.find({
    where: { role: Role.PROVIDER },
    relations: ['suscription', 'suscription.plan'],
  });

  let ingresos = 0;

  const providers = userProviders as Provider[];

  providers.forEach(provider => {
    if (provider.suscription?.plan?.price) {
      ingresos += provider.suscription.plan.price;
    }
  });

  

  return {
    totalClients,
    totalProviders,
    totalUsers,
    ingresos,
  };
}


  // create(createAdminDto: CreateAdminDto) {
  //   return 'This action adds a new admin';
  // }

  // findAll() {
  //   return `This action returns all admin`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} admin`;
  // }

  // update(id: number, updateAdminDto: UpdateAdminDto) {
  //   return `This action updates a #${id} admin`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} admin`;
  // }
}
