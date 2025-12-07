import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { SuscriptionPlanService } from './suscription-plan.service';
import { CreatePlanDto } from './dto/create-suscription-plan.dto';
import { UpdatePlanDto } from './dto/update-suscription-plan.dto';

@Controller('suscription-plan')
export class SuscriptionPlanController {
  constructor(private readonly suscriptionPlanService: SuscriptionPlanService) {}

  @Post()
  create(@Body() createSuscriptionPlanDto: CreatePlanDto) {
    return this.suscriptionPlanService.create(createSuscriptionPlanDto);
  }

  @Get()
  findAll() {
    return this.suscriptionPlanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suscriptionPlanService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSuscriptionPlanDto: UpdatePlanDto) {
    return this.suscriptionPlanService.update(id, updateSuscriptionPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suscriptionPlanService.remove(id);
  }
}
