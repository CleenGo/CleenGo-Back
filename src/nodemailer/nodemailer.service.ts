import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class NodemailerService {
  private readonly logger = new Logger(NodemailerService.name);

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('SENDGRID_API_KEY');

    if (!apiKey) {
      this.logger.error('❌ Falta SENDGRID_API_KEY en variables de entorno');
      throw new Error('SENDGRID_API_KEY missing');
    }

    sgMail.setApiKey(apiKey);
    this.logger.log('✅ SendGrid configurado');
  }

  async sendMail(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    const { to, subject, html, text } = params;

    const fromEmail = this.config.get<string>('MAIL_FROM_ADDRESS');
    const fromName = this.config.get<string>('MAIL_FROM_NAME') || 'CleenGo';

    if (!fromEmail) {
      this.logger.error('❌ Falta MAIL_FROM_ADDRESS en variables de entorno');
      throw new Error('MAIL_FROM_ADDRESS missing');
    }

    try {
      const msg = {
        to,
        from: { email: fromEmail, name: fromName },
        subject,
        text: text ?? subject,
        html,
      };

      const res = await sgMail.send(msg);

      this.logger.log(
        `✅ Email enviado a ${to} (SendGrid status: ${res?.[0]?.statusCode})`,
      );
      return res;
    } catch (err: any) {
      this.logger.error(
        `❌ Error enviando email (SendGrid) a ${to}: ${err?.message || err}`,
      );
      if (err?.response?.body)
        this.logger.error(JSON.stringify(err.response.body));
      throw err;
    }
  }
}
