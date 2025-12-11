// src/nodemailer/nodemailer.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NodemailerService {
  private readonly logger = new Logger(NodemailerService.name);

  // Transporter de Nodemailer (la “conexión” al servidor SMTP)
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    this.transporter = nodemailer.createTransport({
      host, // smtp.gmail.com
      port, // 587
      secure: port === 465, // true: SSL/TLS, false: STARTTLS
      auth: {
        user, // MAIL_USER
        pass, // MAIL_PASSWORD
      },
    });
  }

  // Método genérico para enviar correos
  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    const fromName =
      this.configService.get<string>('MAIL_FROM_NAME') ?? 'CleenGo';

    const fromAddress =
      this.configService.get<string>('MAIL_FROM_ADDRESS') ??
      this.configService.get<string>('MAIL_USER');

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(
        `📧 Email enviado a ${options.to}. MessageId: ${info.messageId}`,
      );

      return info;
    } catch (error) {
      this.logger.error(
        `❌ Error enviando email a ${options.to}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'No se pudo enviar el correo. Intenta más tarde.',
      );
    }
  }
}
