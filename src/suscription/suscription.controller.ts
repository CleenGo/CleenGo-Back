import { Controller, Get, Post, Body, Patch, Param, Delete ,Put} from '@nestjs/common';
import { SuscriptionService } from './suscription.service';
import { CreateSuscriptionDto } from './dto/create-suscription.dto';
import { UpdateSuscriptionDto } from './dto/update-suscription.dto';

@Controller('suscription')
export class SuscriptionController {
  constructor(private readonly suscriptionService: SuscriptionService) {}

  //@Roles(UserRole.admin)
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createSubscriptionDto: CreateSuscriptionDto) {
    return this.suscriptionService.create(createSubscriptionDto);
  }

  @Get()
  findAll() {
    return this.suscriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suscriptionService.findOne(id);
  }

  //@Roles(UserRole.admin)
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSuscriptionDto,
  ) {
    return this.suscriptionService.update(id, updateSubscriptionDto);
  }

  //@Roles(UserRole.admin)
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suscriptionService.remove(id);
  }
}
