//CleenGo-Back/src/appointments/appointments.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
  BadRequestException,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from 'src/enum/appointmenStatus.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { statusDto } from './dto/status.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}


  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req: any) {
    const user = req.user;
    return this.appointmentsService.create(createAppointmentDto, user);
  }

  //trae una cita especifica, verificando que pertenezca al usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    console.log(user);
    return this.appointmentsService.findOne(id, user);
  }
  //trae todas las appointments a nombre del usuario autenticado, sea proveedor o cliente
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Obtener citas del usuario autenticado con filtros opcionales',
    description:
      'Permite obtener todas las citas asociadas al usuario autenticado, ya sea como cliente o proveedor, con la opción de aplicar filtros como estado, fecha, proveedor, cliente o categoría.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado de la cita',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Filtrar por fecha de la cita',
  })
  @ApiQuery({
    name: 'provider',
    required: false,
    description: 'Filtrar por ID del proveedor',
  })
  @ApiQuery({
    name: 'client',
    required: false,
    description: 'Filtrar por ID del cliente',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filtrar por categoría del servicio',
  })
  @ApiOkResponse({
    description: 'Citas obtenidas correctamente',
  })
  findAllUserAppointments(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('provider') provider?: string,
    @Query('client') client?: string,
    @Query('category') category?: string,
  ) {
    const authUser = req.user;
    const filters = { status, date, provider, client, category };
    return this.appointmentsService.findAllUserAppointments(authUser, filters);
  }

  //edita la informacion de un appointment
  // @Roles(Role.PROVIDER)
  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() req: any,
  ) {
    const user = req.user;

    return this.appointmentsService.update(id, updateAppointmentDto, user);
  }

  //edita el status de un appointment
  @UseGuards(JwtAuthGuard)
  @Put('status/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() statusBody: statusDto,
    @Req() req: any,
  ) {
    const user = req.user;
    const status = statusBody.status;

    if (
      status === AppointmentStatus.CONFIRMEDPROVIDER ||
      status === AppointmentStatus.COMPLETED ||
      status === AppointmentStatus.CANCELLED ||
      status === AppointmentStatus.REJECTED
    )
      return this.appointmentsService.updateStatus(id, status, user);
    else throw new BadRequestException('⚠️ Invalid status');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    return this.appointmentsService.remove(id, user);
  }
}
