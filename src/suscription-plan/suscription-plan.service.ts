import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-suscription-plan.dto';
import { UpdatePlanDto } from './dto/update-suscription-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/suscription-plan.entity';

@Injectable()
export class SuscriptionPlanService {
  constructor(
    @InjectRepository(Plan)
        private readonly planRepository: Repository<Plan>
  ) {}
  async create(createPlanDto: CreatePlanDto) {

    const {name, price, description} = createPlanDto;
    const exists = await this.planRepository.findOne({where: {name}});

    if (exists){
      if (exists.isActive === true) throw new BadRequestException('⚠️ Plan ya registrado');
      if(exists.isActive === false) {
        const plan = await this.planRepository.update(exists.id, {...CreatePlanDto,isActive: true});
        return plan
      }
    }
    const plan = this.planRepository.create(createPlanDto);
    return await this.planRepository.save(plan);
  }

  async findAll() {
    const planes = await this.planRepository.find({where: {isActive: true}});
    return planes;
  }

  async findOne(id: string) {
    const plan = await this.planRepository.findOne({where: {id}});

    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    const plan = await this.planRepository.findOne({where: {id:id, isActive: true}});
    
    if (!plan) throw new BadRequestException('⚠️ Plan no encontrado');

    return await this.planRepository.update(id, updatePlanDto);
  }

  async remove(id: string) {
    const plan = await this.planRepository.findOne({where: {id:id, isActive: true}});
    if (!plan) throw new BadRequestException('⚠️ Plan no encontrado');
    return await this.planRepository.update(id, {isActive: false});
  }
}
