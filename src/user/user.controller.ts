import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Request,
  Put,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { AuthenticatedClient } from './interfaces/authenticated-client';
import { get } from 'http';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedClient;
}

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile/:id')
  @Roles(Role.CLIENT, Role.ADMIN)
  @ApiOperation({
    summary: 'Ver perfil de cliente',
    description:
      'Permite a que un cliente vea su perfil o que un admin vea el perfil de un cliente',
  })
  @ApiOkResponse({
    description: 'Perfil de cliente obtenido correctamente',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el perfil del cliente',
  })
  async getClientProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const requester = req.user;

    if (requester.role === Role.CLIENT && requester.id !== id)
      throw new ForbiddenException(`No tienes permiso para ver este perfil`);

    return this.userService.getClientProfile(id);
  }

  @Put('update-profile/:id')
  @Roles(Role.CLIENT, Role.ADMIN)
  @ApiOperation({
    summary: 'Actualizar perfil de cliente',
    description:
      'Permite a que un cliente actualice su perfil o que un admin actualice el perfil de un cliente',
  })
  @ApiOkResponse({
    description: 'Perfil de cliente actualizado correctamente',
  })
  @ApiForbiddenResponse({
    description: 'No tienes permiso para actualizar este perfil',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el perfil del cliente',
  })
  updateClientProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserProfileDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const requester = req.user;

    if (requester.role === Role.CLIENT && requester.id !== id)
      throw new ForbiddenException(
        `No tienes permiso para actualizar este perfil`,
      );

    return this.userService.updateClientProfile(id, updateUserDto);
  }

  @Get('all-clients')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Listar clientes con filtros y paginación',
    description:
      'Permite al admin ver todos los clientes registrados, con opciones de filtrado por nombre, email o estado, y paginación.',
  })
  @ApiOkResponse({
    description: 'Lista de clientes obtenida correctamente',
  })
  @ApiForbiddenResponse({
    description: 'Solo el administrador puede acceder a la lista de clientes',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: '10',
    description: 'Número de página para la paginación (por defecto 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: '10',
    description:
      'Número de clientes mostrados por página para la paginación (por defecto 10)',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    example: 'Juan',
    description: 'Filtrar clientes por nombre',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    example: 'juan@example.com',
    description: 'Filtrar clientes por email',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    example: 'activo',
    description: 'Filtrar clientes por estado (true o activo/false oinactivo)',
  })
  getAllClients(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('status') status?: string,
  ) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    const filters = {
      name,
      email,
      isActive:
        typeof status === 'string'
          ? status.toLowerCase() === 'true' || status.toLowerCase() === 'activo'
          : undefined,
    };

    return this.userService.getAllClients(pageNumber, limitNumber, filters);
  }

  //* 11. Como cliente quiero poder eliminar mi cuenta de usuario (módulo user).
  @Delete('delete-profile/:id')
  @Roles(Role.CLIENT, Role.ADMIN)
  @ApiOperation({
    summary: 'Eliminar (desactivar) cuenta de cliente',
    description:
      'Permite al cliente eliminar su propia cuenta (soft delete) o al administrador desactivar la cuenta de un cliente.',
  })
  @ApiOkResponse({
    description: 'Cuenta de cliente eliminada (desactivada) correctamente.',
  })
  @ApiForbiddenResponse({
    description:
      'El cliente solo puede eliminar su propia cuenta. Solo el admin puede eliminar cuentas de otros clientes.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el cliente.',
  })
  async deleteClientProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const requester = req.user;

    if (requester.role === Role.CLIENT && requester.id !== id) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este perfil.',
      );
    }

    return this.userService.deleteClientProfile(id);
  }
}
