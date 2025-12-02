import {
  Controller,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiBody, ApiOkResponse, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { RegisterProviderDto } from 'src/provider/dto/create-provider.dto';
import { Role } from 'src/enum/role.enum';
import { ThirdPartyAuthDto } from './dto/third-party-auth.dto';
import { AuthenticatedClient } from 'src/user/interfaces/authenticated-client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //? -------- Registro de cliente --------
  @ApiBody({
    type: RegisterUserDto,
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Cliente registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al registrar cliente' })
  @Post('register/client')
  clientSignUp(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.clientSignUp(registerUserDto);
  }

  //? -------- Registro de proveedor --------
  @ApiBody({
    type: RegisterProviderDto,
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Proveedor registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Error al registrar proveedor' })
  @Post('register/provider')
  providerSignUp(@Body() registerProviderDto: RegisterProviderDto) {
    return this.authService.providerSignUp(registerProviderDto);
  }

  //? -------- Inicio de sesión --------
  @ApiOperation({
    summary: 'Inicio de sesión',
    description: 'Inicio de sesión de usuarios con email y contraseña',
  })
  @ApiBody({
    type: LoginAuthDto,
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Usuario autenticado exitosamente' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @Post('login')
  logIn(@Body() loginUser: LoginAuthDto) {
    return this.authService.logIn(loginUser);
  }

  //? -------- OAuth --------
  @ApiOperation({
    summary: 'Login/registro con terceros (Supabase OAuth)',
    description:
      'Usa el accessToken de Supabase para autenticar al usuario y devolver un JWT propio',
  })
  @ApiParam({
    name: 'role',
    required: true,
    example: 'client o provider',
    description: 'Rol con el que se registrará o autenticará el usuario',
  })
  @ApiBody({ type: ThirdPartyAuthDto })
  @ApiOkResponse({
    description:
      'Usuario autenticado/registrado exitosamente con proveedor externo',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido o rol inválido',
  })
  @Post('third-party/:role')
  @HttpCode(HttpStatus.OK)
  thirdPartyAuth(
    @Param('role') roleParam: string,
    @Body() body: ThirdPartyAuthDto,
  ) {
    return this.authService.thirdPartyAuth(roleParam, body);
  }

  //!--------AGREGAR ESTAS ACCIONES EN AUTH CONTROLLER Y SERVICE --------
  //* 1. Como cliente quiero poder cambiar mi contraseña (módulo autenticación).
  //* 2. Como cliente quiero poder recuperar mi contraseña si la olvido (módulo autenticación).
  //* 3. Como cliente quiero poder cerrar sesión de manera segura (módulo de autenticación).
}
