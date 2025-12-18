import { Controller, Get } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtiene todos los servicios activos' })
  @ApiOkResponse({ description: 'Lista de servicios activos' })
  findAll() {
    return this.servicesService.findAll();
  }
}
