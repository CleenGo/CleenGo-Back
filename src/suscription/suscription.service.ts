import { Injectable , BadRequestException, BadGatewayException } from '@nestjs/common';
import { CreateSuscriptionDto } from './dto/create-suscription.dto';
import { UpdateSuscriptionDto } from './dto/update-suscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Suscription } from './entities/suscription.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Plan } from 'src/suscription-plan/entities/suscription-plan.entity';
import { Provider } from 'src/provider/entities/provider.entity';

@Injectable()
export class SuscriptionService {
  constructor(
    @InjectRepository(Suscription)
    private readonly subscriptionsRepository: Repository<Suscription>,
    @InjectRepository(User)
    private readonly userRepositry: Repository<User>,
        @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
        @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    
  ) {}
// 🔵 CREATE
  async create(createSubscriptionDto: CreateSuscriptionDto) {
    const { planId, providerId, startDate } = createSubscriptionDto;

    // Validar Plan
    const plan = await this.planRepository.findOne({ where: { id: planId } });
    if (!plan) throw new BadRequestException('Plan not found');

    // Validar Provider
    const provider = await this.providerRepository.findOne({
      where: { id: providerId },
    });
    if (!provider) throw new BadRequestException('Provider not found');

    // Validar fecha
    if (!startDate) throw new BadRequestException('startDate is required');

    const subscription = this.subscriptionsRepository.create({
      plan,
      provider,
      startDate: new Date(startDate),
      paymentStatus: false,
      isActive: true,
    });

    await this.subscriptionsRepository.save(subscription);

    return {
      message: 'Subscription created successfully',
      subscription,
    };
  }
    // 🔵 FIND ALL
  async findAll() {
    return await this.subscriptionsRepository.find({
      where: { isActive: true },
      relations: ['plan', 'provider'],
    });
  }
// 🔵 FIND ONE
  async findOne(id: string) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
      relations: ['plan', 'provider'],
    });

    if (!subscription)
      throw new BadGatewayException('Subscription not found');

    return subscription;
  }


async update(id: string, updateSubscriptionDto: UpdateSuscriptionDto) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
    });

    if (!subscription)
      throw new BadRequestException('Subscription not found');

    const { planId, startDate,paymentStatus, isActive } = updateSubscriptionDto;

    // Cambiar plan
    if (planId) {
      const plan = await this.planRepository.findOne({ where: { id: planId } });
      if (!plan) throw new BadRequestException('Plan not found');
      subscription.plan = plan;
    }

    // Cambiar fecha
    if (startDate) subscription.startDate = new Date(startDate);

    // Cambios en flags
    if (paymentStatus !== undefined) subscription.paymentStatus = paymentStatus;
    if (isActive !== undefined) subscription.isActive = isActive;

    await this.subscriptionsRepository.save(subscription);

    return subscription;
  }





  // 🔵 REMOVE (soft delete)
  async remove(id: string) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
    });

    if (!subscription)
      throw new BadGatewayException('Subscription not found');

    subscription.isActive = false;
    await this.subscriptionsRepository.save(subscription);

    return { message: 'Subscription deactivated', subscription };
  }

}
