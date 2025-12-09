// src/app.module.ts
//? Configuración principal de la aplicación NestJS y conexión a la base de datos usando TypeORM.

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { ProviderModule } from './provider/provider.module';
import { AdminModule } from './admin/admin.module';
import { SuscriptionModule } from './suscription/suscription.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CategoriesModule } from './categories/categories.module';
import { getTypeOrmOptions } from './config/typeorm.config';
import { FileUploadModule } from './file-upload/file-upload.module';
import { UserModule } from './user/user.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SeedModule } from './seeder/seeder.module';
import { SuscriptionPlanModule } from './suscription-plan/suscription-plan.module';
import { RedisModule } from './redis/redis-cache.module';
import { DashboardCacheModule } from './Dashboard/dashboard-cache.module';
import { DashboardCronModule } from './Dashboard/dashboard-cron.module';

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
    ProviderModule,
    AdminModule,
    SuscriptionModule,
    AppointmentsModule,
    CategoriesModule,
    FileUploadModule,
    UserModule,
    ReviewsModule,
    CategoriesModule,
    SeedModule,
    SuscriptionPlanModule,
    RedisModule,
    DashboardCacheModule,
    DashboardCronModule,
  ],
})
export class AppModule {}
