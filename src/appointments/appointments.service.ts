// CleenGo-Back/src/appointments/appointments.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { filterAppointmentDto } from './dto/filter-appointment.dto';

import { AppointmentStatus } from 'src/enum/appointmenStatus.enum';
import { Role } from 'src/enum/role.enum';

import { User } from 'src/user/entities/user.entity';
import { Service } from 'src/categories/entities/services.entity';
import { Provider } from 'src/provider/entities/provider.entity';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,

    private readonly nodemailerService: NodemailerService,
  ) {}

  // ================== CHAT ==================
  async getParticipantsOrFail(appointmentId: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: { clientId: true, providerId: true },
      select: {
        id: true,
        status: true,
        isActive: true,
        clientId: { id: true },
        providerId: { id: true },
      },
    });

    if (!appointment) throw new NotFoundException('La cita no existe');
    if (!appointment.isActive)
      throw new ForbiddenException('La cita no está activa');

    if (appointment.status !== AppointmentStatus.CONFIRMEDPROVIDER) {
      throw new ForbiddenException(
        'El chat solo está disponible cuando la cita ha sido confirmada por el proveedor',
      );
    }

    return {
      clientId: appointment.clientId?.id,
      providerId: appointment.providerId?.id,
    };
  }

  // ================== CREATE (UNIFICADO) ==================
  async create(createAppointmentDto: CreateAppointmentDto, authUser: any) {
    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
    });
    if (!user) throw new NotFoundException('user not found');

    const { service, date, startTime, notes, providerEmail, address } =
      createAppointmentDto;

    if (
      !service ||
      !date ||
      !startTime ||
      !notes ||
      !providerEmail ||
      !address
    ) {
      throw new BadRequestException('all required fields must be complete');
    }

    // Fecha debe ser futura
    const appointmentDateType = new Date(date);
    appointmentDateType.setMinutes(
      appointmentDateType.getMinutes() +
        appointmentDateType.getTimezoneOffset(),
    );
    const today = new Date();

    if (appointmentDateType <= today) {
      throw new BadRequestException(
        'the appointment date must be later than the current date',
      );
    }

    // Servicio y proveedor
    const foundService = await this.serviceRepository.findOneBy({
      name: service,
    });

    const providerFound = await this.providerRepository.findOne({
      where: { email: providerEmail, role: Role.PROVIDER },
      relations: ['services'], // para validar que lo ofrezca
    });

    if (!foundService) throw new NotFoundException('service not found');
    if (!providerFound) throw new NotFoundException('Provider not found');

    if (
      providerFound.services &&
      !providerFound.services.includes(foundService)
    ) {
      throw new BadRequestException(
        `El proveedor no ofrece el servicio ${service}`,
      );
    }

    this.validateProviderWorksThatDay(providerFound, date);
    this.validateStartHourInWorkingRange(providerFound, startTime);
    await this.validateNoStartOverlap(providerFound.id, date, startTime);

    // Crear appointment
    const appointment = new Appointment();
    appointment.clientId = user;
    appointment.providerId = providerFound;
    appointment.date = date;
    appointment.startHour = startTime;
    appointment.notes = notes;
    appointment.addressUrl = address;

    // Compatibilidad por si tu entidad usa `serviceId` o `services`
    if ('serviceId' in appointment)
      (appointment as any).serviceId = foundService;
    if ('services' in appointment) (appointment as any).services = foundService;

    await this.appointmentRepository.save(appointment);

    // Email al proveedor (tu aporte + lo de tu compa)
    const stringDate = this.formatDateDDMMYYYY(date);
    await this.newAppointmentEmailProvider(
      providerFound.email,
      user.name,
      providerFound.name,
      foundService.name,
      stringDate,
      startTime,
      address,
    );

    return appointment;
  }

  // ================== FIND ALL USER APPOINTMENTS ==================
  async findAllUserAppointments(authUser: any, filters: filterAppointmentDto) {
    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
    });
    if (!user) throw new BadRequestException('⚠️ User not found');

    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.clientId', 'client')
      .leftJoinAndSelect('appointment.providerId', 'provider')
      .leftJoinAndSelect('appointment.serviceId', 'service')
      .leftJoinAndSelect('service.categoryId', 'category');

    // Unificado: que vea citas donde es cliente o proveedor
    query.where('(client.id = :user OR provider.id = :user)', {
      user: user.id,
    });

    if (filters.status) {
      query.andWhere('appointment.status = :status', {
        status: filters.status,
      });
    }

    if (filters.category) {
      query.andWhere('category.name = :category', {
        category: filters.category,
      });
    }

    if (filters.provider) {
      query.andWhere('provider.name = :provider', {
        provider: filters.provider,
      });
    }

    if (filters.client) {
      query.andWhere('client.name = :client', {
        client: filters.client,
      });
    }

    if (filters.date) {
      query.andWhere('appointment.date = :date', {
        date: filters.date,
      });
    }

    query.orderBy('appointment.date', 'DESC');

    const appointments: Appointment[] = await query.getMany();

    if (user.role === Role.PROVIDER) {
      const providerAppointments = appointments.filter(
        (appointment) => appointment.providerId?.id === user.id,
      );
      const clientAppointments = appointments.filter(
        (appointment) => appointment.clientId?.id === user.id,
      );

      return { providerAppointments, clientAppointments };
    } else {
      const providerAppointments: Appointment[] = [];
      const clientAppointments = appointments.filter(
        (appointment) => appointment.clientId?.id === user.id,
      );

      return { providerAppointments, clientAppointments };
    }
  }

  // ================== FIND ONE ==================
  async findOne(id: string, authUser: any) {
    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
    });
    if (!user) throw new BadRequestException('⚠️ User not found');

    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['clientId', 'providerId', 'serviceId', 'services'],
    });
    if (!appointment) throw new BadRequestException('⚠️ Appointment not found');

    if (
      appointment.clientId?.id !== user.id &&
      appointment.providerId?.id !== user.id
    ) {
      throw new BadRequestException(
        '⚠️ You are not the owner of this appointment',
      );
    }

    return appointment;
  }

  // ================== UPDATE ==================
  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    authUser: any,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
    });
    if (!user) throw new BadRequestException('⚠️ User not found');

    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['providerId'],
    });
    if (!appointment) throw new BadRequestException('⚠️ Appointment not found');

    if (appointment.providerId?.id !== user.id) {
      throw new BadRequestException(
        '⚠️ Only the provider can update this appointment',
      );
    }

    if (updateAppointmentDto.endHour)
      appointment.endHour = updateAppointmentDto.endHour;
    if (updateAppointmentDto.price)
      appointment.price = updateAppointmentDto.price;

    return this.appointmentRepository.save(appointment);
  }

  // ================== UPDATE STATUS ==================
  async updateStatus(id: string, status: AppointmentStatus, authUser: any) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['clientId', 'providerId'],
    });
    if (!appointment) throw new BadRequestException('⚠️ Appointment not found');

    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
    });
    if (!user) throw new BadRequestException('⚠️ User not found');

    if (
      appointment.clientId?.id !== user.id &&
      appointment.providerId?.id !== user.id
    ) {
      throw new BadRequestException(
        '⚠️ You are not the owner of this appointment',
      );
    }

    if (appointment.status === status)
      throw new BadRequestException('⚠️ The status is the same');
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('⚠️ The status is already cancelled');
    }

    if (
      status === AppointmentStatus.PENDING &&
      user.id !== appointment.providerId?.id
    ) {
      throw new BadRequestException(
        '⚠️ only the provider can change the status to pending',
      );
    }

    appointment.status = status;
    return this.appointmentRepository.save(appointment);
  }

  // ================== REMOVE (SOFT DELETE) ==================
  async remove(id: string, authuser: any) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['clientId', 'providerId'],
    });

    const user = await this.userRepository.findOne({
      where: { id: authuser.id },
    });
    if (!user) throw new BadRequestException('⚠️ User not found');
    if (!appointment) throw new BadRequestException('⚠️ Appointment not found');

    if (user.role === 'client' && appointment.clientId?.id !== user.id) {
      throw new BadRequestException(
        '⚠️ You are not the owner of this appointment',
      );
    }
    if (user.role === 'provider' && appointment.providerId?.id !== user.id) {
      throw new BadRequestException(
        '⚠️ You are not the owner of this appointment',
      );
    }

    return this.appointmentRepository.update(id, { isActive: false });
  }

  // ================== CRONS / EMAILS ==================
  async validatePendingAppointments() {
    const providers = await this.providerRepository.find({
      where: { isActive: true },
    });

    providers.forEach(async (provider) => {
      const providerId = provider.id;
      const appointments = await this.appointmentRepository.count({
        where: {
          providerId: { id: providerId } as any,
          status: AppointmentStatus.PENDING,
        } as any,
      });

      if (appointments > 0) {
        await this.pendingAppointmentEmail(
          provider.email,
          provider.name,
          appointments,
        );
      }
    });
  }

  async upcommingAppointments() {
    const providers = await this.providerRepository.find({
      where: { isActive: true, role: Role.PROVIDER } as any,
    });

    providers.forEach(async (provider) => {
      const providerId = provider.id;
      const { start, end } = this.getTomorrowRange();

      const appointments = await this.appointmentRepository.find({
        where: {
          date: Between(start as any, end as any) as any,
          status: AppointmentStatus.CONFIRMEDPROVIDER,
          providerId: { id: providerId } as any,
        } as any,
        relations: ['clientId', 'providerId', 'serviceId'],
      });

      if (appointments.length > 0) {
        await this.upcommingAppointmentProvider(
          provider.name,
          provider.email,
          appointments,
        );
      }
    });

    const clients = await this.userRepository.find({
      where: { isActive: true, role: Role.CLIENT } as any,
    });

    clients.forEach(async (client) => {
      const clientId = client.id;
      const { start, end } = this.getTomorrowRange();

      const appointments = await this.appointmentRepository.find({
        where: {
          date: Between(start as any, end as any) as any,
          status: AppointmentStatus.CONFIRMEDPROVIDER,
          clientId: { id: clientId } as any,
        } as any,
        relations: ['clientId', 'providerId', 'serviceId'],
      });

      if (appointments.length > 0) {
        await this.upcommingAppointmentClient(
          client.name,
          client.email,
          appointments,
        );
      }
    });
  }

  // ================== HELPERS ==================
  private validateProviderWorksThatDay(
    provider: Provider,
    date: string | Date,
  ) {
    const paseDate = new Date(date);
    paseDate.setHours(12, 0, 0, 0);

    let day = paseDate
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toUpperCase();

    day = day.charAt(0).concat(day.slice(1).toLowerCase());

    if (!provider.days?.includes(day)) {
      throw new BadRequestException(`Provider does not work on ${day}`);
    }
  }

  private validateStartHourInWorkingRange(
    provider: Provider,
    startHour: string,
  ) {
    const start = this.timeToMinutes(startHour);

    const isInside = provider.hours?.some((range) => {
      const [from, to] = range.split('-');
      const fromMin = this.timeToMinutes(from);
      const toMin = this.timeToMinutes(to);
      return start >= fromMin && start <= toMin;
    });

    if (!isInside) {
      throw new BadRequestException(`Provider is not working at ${startHour}`);
    }
  }

  private async validateNoStartOverlap(
    providerId: string,
    date: Date | string,
    startHour: string,
  ) {
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        providerId: { id: providerId } as any,
        date: new Date(date) as any,
        isActive: true,
      } as any,
    });

    const newStart = this.timeToMinutes(startHour);

    const hasOverlap = existingAppointments.some((a) => {
      const appointmentStart = this.timeToMinutes(a.startHour);
      const appointmentEnd = this.timeToMinutes(a.endHour);
      return newStart >= appointmentStart && newStart < appointmentEnd;
    });

    if (hasOverlap) {
      throw new BadRequestException(
        `Provider already has an appointment at ${startHour}`,
      );
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatDateDDMMYYYY(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private getTomorrowRange() {
    const now = new Date();

    const start = new Date(now);
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // ================== NODEMAILER HELPERS ==================
  private async newAppointmentEmailProvider(
    email: string,
    clientName: string,
    providerName: string,
    serviceName: string,
    date: string,
    time: string,
    address: string,
  ) {
    const subject = 'Tienes una nueva solicitud de turno en CleenGo🧼 ';
    const html = `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Nuevo servicio asignado</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 24px;">
            <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="background: #27ae60; padding: 20px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 22px;">📢 Nuevo servicio asignado</h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 24px; color: #333333;">
                  <p style="font-size: 16px; margin-top: 0;">
                    Hola <strong>${providerName}</strong>,
                  </p>

                  <p style="font-size: 15px;">
                    Se te ha asignado un <strong>nuevo servicio</strong>.  
                    A continuación encontrarás los detalles:
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9fb; border-radius: 6px; margin: 20px 0;">
                    <tr>
                      <td style="padding: 16px;">
                        <p style="margin: 4px 0;"><strong>🧾 Servicio:</strong> ${serviceName}</p>
                        <p style="margin: 4px 0;"><strong>👤 Cliente:</strong> ${clientName}</p>
                        <p style="margin: 4px 0;"><strong>📅 Fecha:</strong> ${date}</p>
                        <p style="margin: 4px 0;"><strong>⏰ Horario:</strong> ${time}</p>
                        <p style="margin: 4px 0;"><strong>📍 Dirección:</strong> ${address}</p>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size: 15px;">
                    Por favor, asegurate de presentarte en la fecha y horario indicados.
                  </p>

                  <p style="margin-top: 24px;">
                    Gracias por tu compromiso.<br />
                    <strong>Equipo de Coordinación</strong>
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background: #f1f3f5; padding: 16px; text-align: center; font-size: 12px; color: #777777;">
                  Este es un correo automático. Por favor, no respondas a este mensaje.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

    const text = `¡Hola, ${providerName}!
Tienes una nueva solicitud de servicio pendiente en CleenGo.`;

    try {
      await this.nodemailerService.sendMail({
        to: email,
        subject,
        html,
        text,
      });
    } catch (error: any) {
      this.logger.error(
        `❌ Error enviando email nueva cita a ${email}: ${error.message}`,
      );
    }
  }

  private async pendingAppointmentEmail(
    email: string,
    providerName: string,
    pendingCount: number,
  ) {
    const html = `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Acción requerida – Servicios pendientes</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 24px;">
            <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="background: #eb5757; padding: 20px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 22px;">⚠️ Acción requerida – Confirmá tus servicios</h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 24px; color: #333333;">
                  <p style="font-size: 16px; margin-top: 0;">
                    Hola <strong>${providerName}</strong>,
                  </p>

                  <p style="font-size: 15px;">
                    Tenés <strong>${pendingCount}</strong> servicio${pendingCount > 1 ? 's' : ''} 
                    pendiente${pendingCount > 1 ? 's' : ''} de <strong>confirmación</strong>.
                  </p>

                  <p style="font-size: 14px; color: #555;">
                    ⚠️ Si no se confirma el servicio con antelación, podría ser reasignado.
                  </p>

                  <p style="margin-top: 24px;">
                    Gracias por tu rápida respuesta.<br />
                    <strong>Equipo de Coordinación</strong>
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background: #f1f3f5; padding: 16px; text-align: center; font-size: 12px; color: #777777;">
                  Este es un correo automático. Por favor, no respondas a este mensaje.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

    const text = `¡Hola, ${providerName}! Tienes ${pendingCount} servicio${
      pendingCount > 1 ? 's' : ''
    } pendiente${pendingCount > 1 ? 's' : ''} de confirmación.`;

    try {
      await this.nodemailerService.sendMail({
        to: email,
        subject: 'Acción requerida – Servicios pendientes',
        html,
        text,
      });
    } catch (error: any) {
      this.logger.error(
        `❌ Error enviando email pendientes a ${email}: ${error.message}`,
      );
    }
  }

  private async upcommingAppointmentProvider(
    providerName: string,
    providerEmail: string,
    upcommingAppointments: Appointment[],
  ) {
    const subject = `⏰ Recordatorio: tenés un servicio mañana`;
    const html = `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Recordatorio de servicio</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 24px;">
            <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="background: #27ae60; padding: 20px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 22px;">⏰ Recordatorio de servicio</h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 24px; color: #333333;">
                  <p style="font-size: 16px; margin-top: 0;">Hola <strong>${providerName}</strong>,</p>

                  <p style="font-size: 15px;">
                    Te recordamos que <strong>mañana</strong> tienes asignados los siguientes servicios:
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    ${upcommingAppointments
                      .map((a) => {
                        const serviceName =
                          (a as any)?.serviceId?.name ??
                          (a as any)?.services?.name ??
                          String((a as any)?.services ?? '');
                        const clientName =
                          (a as any)?.clientId?.name ??
                          (a as any)?.client?.name ??
                          '';
                        return `
                        <tr>
                          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                            <p style="margin: 2px 0;"><strong>🧾 ${serviceName}</strong></p>
                            <p style="margin: 2px 0;">👤 Cliente: ${clientName}</p>
                            <p style="margin: 2px 0;">⏰ ${a.startHour}</p>
                            <p style="margin: 2px 0;">📍 ${a.addressUrl ?? ''}</p>
                          </td>
                        </tr>
                      `;
                      })
                      .join('')}
                  </table>

                  <p style="font-size: 15px;">
                    Por favor, asegurate de presentarte en los horarios indicados.
                  </p>

                  <p style="margin-top: 24px;">
                    Gracias por tu compromiso.<br />
                    <strong>Equipo de Coordinación</strong>
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background: #f1f3f5; padding: 16px; text-align: center; font-size: 12px; color: #777777;">
                  Este es un correo automático. Por favor, no respondas a este mensaje.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

    const text = `Hola ${providerName}, te recordamos que mañana tenés un servicio.`;

    try {
      await this.nodemailerService.sendMail({
        to: providerEmail,
        subject,
        html,
        text,
      });
    } catch (error: any) {
      this.logger.error(
        `❌ Error enviando email recordatorio a ${providerEmail}: ${error.message}`,
      );
    }
  }

  private async upcommingAppointmentClient(
    clientName: string,
    clientEmail: string,
    upcommingAppointments: Appointment[],
  ) {
    const subject = `⏰ Recordatorio: tu servicio es mañana`;
    const html = `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Recordatorio de servicio</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 24px;">
            <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="background: #2f80ed; padding: 20px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 22px;">⏰ Recordatorio de servicio</h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 24px; color: #333333;">
                  <p style="font-size: 16px; margin-top: 0;">Hola <strong>${clientName}</strong>,</p>

                  <p style="font-size: 15px;">
                    Te recordamos que <strong>mañana</strong> tienes programados los siguientes servicios:
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    ${upcommingAppointments
                      .map((a) => {
                        const serviceName =
                          (a as any)?.serviceId?.name ??
                          (a as any)?.services?.name ??
                          String((a as any)?.services ?? '');
                        const providerName =
                          (a as any)?.providerId?.name ??
                          (a as any)?.provider?.name ??
                          '';
                        return `
                        <tr>
                          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                            <p style="margin: 2px 0;"><strong>🧾 ${serviceName}</strong></p>
                            <p style="margin: 2px 0;">👤 Proveedor: ${providerName}</p>
                            <p style="margin: 2px 0;">⏰ ${a.startHour}</p>
                          </td>
                        </tr>
                      `;
                      })
                      .join('')}
                  </table>

                  <p style="font-size: 15px;">
                    Si necesitás modificar o cancelar algún servicio, podés hacerlo desde la plataforma.
                  </p>

                  <p style="margin-top: 24px;">
                    ¡Gracias por confiar en nosotros!<br />
                    <strong>Equipo de Soporte</strong>
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background: #f1f3f5; padding: 16px; text-align: center; font-size: 12px; color: #777777;">
                  Este es un correo automático. Por favor, no respondas a este mensaje.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

    const text = `Hola ${clientName}, te recordamos que mañana tienes ${
      upcommingAppointments.length > 1 ? 'servicios' : 'un servicio'
    } programado.`;

    try {
      await this.nodemailerService.sendMail({
        to: clientEmail,
        subject,
        html,
        text,
      });
    } catch (error: any) {
      this.logger.error(
        `Error al enviar el correo a ${clientEmail}: ${error.message}`,
      );
    }
  }
}
