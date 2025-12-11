import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

//   @Post()
//   create(@Body() createAppointmentDto: CreateAppointmentDto) {
//     return this.appointmentsService.create(createAppointmentDto);
//   }

//   @Get()

//   //trae todas las appointments a nombre del usuario autenticado, sea proveedor o cliente
//   findAllUserAppointments(@Req() req: any, 
//   @Query('status') status?: string,
//   @Query('date') date?: string,
//   @Query('provider') provider?: string,
//   @Query('client') client?: string,
//   @Query('category') category?: string
// ) {
//     const authUser = req.user;
//     const filters = { status, date, provider, client, category };
//     return this.appointmentsService.findAllUserAppointments(authUser, filters);
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.appointmentsService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
//     return this.appointmentsService.update(+id, updateAppointmentDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.appointmentsService.remove(+id);
//   }
}
