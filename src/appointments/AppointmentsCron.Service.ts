import { Injectable, Logger } from "@nestjs/common";
import { AppointmentsService } from "./appointments.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class AppointmentsCronService {
      // 🔹 NUEVO: logger para mensajes de nodemailer / recovery
        private readonly logger = new Logger(AppointmentsService.name);
    constructor(
        private readonly appointmentsService: AppointmentsService
    ){}

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handlependingAppointments() {
        console.log('Cron: enviando emails de citas pendientes...');
        await this.appointmentsService.validatePendingAppointments();
    }
    @Cron(CronExpression.EVERY_DAY_AT_11AM)
    async handleUpcomingAppointments() {
        console.log('Cron: enviando emails de citas proximas...');
        try{
            await this.appointmentsService.upcommingAppointments();
        }catch(error) {
            this.logger.error(error);
        }
    }
}