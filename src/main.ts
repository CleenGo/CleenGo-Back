import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173'], //! front (dev). Agregar el dominio de producción cuando esté disponible
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  //Configurar swagger
  const config = new DocumentBuilder()
    .setTitle('CleenGo API')
    .setDescription('Documentación de la API de CleenGo')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory()); //http://localhost:3000/api

  await app.listen(process.env.PORT ?? 3000);
  try {
    console.log(
      `🚀 Servidor is running on http://localhost:${process.env.PORT ?? 3000}`,
    );
  } catch (error) {
    console.error('⚠️ Error al iniciar el servidor:', error);
  }
}

bootstrap();
