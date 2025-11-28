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
import { ApiBody, ApiOkResponse, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';

@Controller('provider')
export class ProviderController {
  constructor(
    private readonly providerService: ProviderService,
  ) {}



    
  @Get()
  findAll() {
    return this.providerService.findAll();
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

    @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providerService.findOne(id);
  }


  //@Roles(UserRole.admin, UserRole.provider)
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() UpdateProviderDto: UpdateProviderDto,
  ) {
    return this.providerService.update(id, UpdateProviderDto);
  }

  //@Roles(UserRole.admin)
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id') // solo admin
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
