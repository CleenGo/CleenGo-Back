//CleenGo-Back/src/provider/provider.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProviderService } from './provider.service';
import { RegisterProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Query } from '@nestjs/common';
import { Role } from 'src/enum/role.enum';
import {
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { FilterProviderDto } from './dto/filterProvider.dto';
import { filter } from 'rxjs';

@ApiTags('Providers')
@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  //trae  a todos los provedores
  @Get()
  @ApiOperation({ summary: 'Obtiene todos los proveedores' })
  @ApiResponse({ status: 200, description: 'Lista de proveedores encontrada' })
  findAll() {
    return this.providerService.findAll();
  }

  @Get('filter')
  @ApiQuery({
    name: 'day',
    required: false,
    type: String,
    description: 'Día para filtrar proveedores (ej: Monday)',
  })
  @ApiQuery({
    name: 'hour',
    required: false,
    type: String,
    description: 'Horario para filtrar proveedores (ej: 09:00-12:00)',
  })
  filterProviders(@Query() filters: FilterProviderDto) {
    return this.providerService.filterProviders(filters);
  }
  /*   
  // GET /serviceproviders/search?name=Juan&category=Peluqueria (forma de poner para probar )
  @Get('search')
  search(@Query('name') name?: string, @Query('category') category?: string) {
    return this.providerService.search(name, category);
  } */

  /*     //@Roles(UserRole.provider)
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Get('dashboard')
  dashboard(@Req() req) {
    const user = req.user;
    return this.providerService.dashboard(user);
    
  } */

  //trae a los provedores por id
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un proveedor por su ID' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  findOne(@Param('id') id: string) {
    return this.providerService.findOne(id);
  }

  //actializa los datos de los provedores
  // PATCH /provider/:id
  //@Roles(UserRole.admin, UserRole.provider)
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza un proveedor por ID' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  @ApiResponse({
    status: 200,
    description: 'Proveedor actualizado correctamente',
  })
  update(
    @Param('id') id: string,
    @Body() UpdateProviderDto: UpdateProviderDto,
  ) {
    return this.providerService.update(id, UpdateProviderDto);
  }

  //borrado logico
  //@Roles(UserRole.admin)
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id') // solo admin
  @ApiOperation({ summary: 'Elimina un proveedor (borrado lógico)' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado' })
  remove(@Param('id') id: string) {
    return this.providerService.remove(id);
  }
  /* 
  @Get('providers')
async getProviders(
  @Query('name') name?: string,
  @Query('category') category?: string,
  @Query('day') day?: string,
) {
  return this.providerService.filterProviders(name, category, day);
}
// como usar :
// /providers?name=Juan
// /providers?category=Peluqueria
// /providers?day=lunes
// /providers?name=Juan&category=Peluqueria&day=lunes
 */
}
