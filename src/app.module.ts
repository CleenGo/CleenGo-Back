// src/app.module.ts
//? Configuración principal de la aplicación NestJS y conexión a la base de datos usando TypeORM.

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { ProviderModule } from './provider/provider.module';
import { AdminModule } from './admin/admin.module';
import { SuscriptionModule } from './suscription/suscription.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CategoriesModule } from './categories/categories.module';

import { getTypeOrmOptions } from './config/typeorm.config';
import { FileUploadModule } from './file-upload/file-upload.module';
import { UserModule } from './user/user.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    TypeOrmModule.forRootAsync({
      useFactory: () => getTypeOrmOptions(),
    }),

    AuthModule,
    ClientModule,
    ProviderModule,
    AdminModule,
    SuscriptionModule,
    AppointmentsModule,
    CategoriesModule,
    FileUploadModule,
    UserModule,
    ReviewsModule,
  ],
})
export class AppModule {}
