//CleenGo-Back/src/suscription-plan/suscription-plan.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SuscriptionPlanService } from './suscription-plan.service';
import { CreatePlanDto } from './dto/create-suscription-plan.dto';
import { UpdatePlanDto } from './dto/update-suscription-plan.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('plan')
export class SuscriptionPlanController {
  constructor(
    private readonly suscriptionPlanService: SuscriptionPlanService,
  ) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSuscriptionPlanDto: UpdatePlanDto,
  ) {
    return this.suscriptionPlanService.update(id, updateSuscriptionPlanDto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suscriptionPlanService.remove(id);
  }
}
