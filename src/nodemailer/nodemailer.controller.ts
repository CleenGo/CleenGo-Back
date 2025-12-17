// CleenGo-Back/src/nodemailer/nodemailer.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

class TestEmailDto {
  @IsEmail()
  to: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

@ApiTags('Nodemailer')
@Controller('nodemailer')
export class NodemailerController {
  constructor(private readonly nodemailerService: NodemailerService) {}

  @Post('test')
  @ApiOperation({
    summary: 'Enviar email de prueba',
    description:
      'Envía un correo de prueba usando la configuración de Nodemailer (Gmail).',
  })
  @ApiBody({
    type: TestEmailDto,
    examples: {
      ejemplo1: {
        summary: 'Correo de prueba básico',
        value: {
          to: 'tucorreo@ejemplo.com',
          subject: 'Correo de prueba CleenGo 🎉',
          message: 'Hola, este es un correo de prueba desde el backend 👋',
        },
      },
    },
  })
  async sendTestEmail(@Body() body: TestEmailDto) {
    const { to, subject, message } = body;

    const html = `
      <h1>📧 Prueba de correo CleenGo</h1>
      <p>${message ?? 'Este es un correo de prueba desde el backend.'}</p>
      <p style="font-size: 12px; color: #888;">
        Enviado automáticamente por el backend de CleenGo.
      </p>
    `;

    await this.nodemailerService.sendMail({
      to,
      subject: subject ?? 'Prueba de correo CleenGo',
      html,
      text: message ?? 'Este es un correo de prueba desde el backend.',
    });

    return {
      message: '✅ Email de prueba enviado correctamente',
      to,
    };
  }
}
