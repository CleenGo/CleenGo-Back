// src/config/typeorm.config.ts
//? Configuración de TypeORM para la conexión a la base de datos PostgreSQL.

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmOptions = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '6543', 10), // para supabase puerto 6543
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  

  //dev: sincroniza; prod: usa migraciones
  synchronize: process.env.NODE_ENV === 'development' ? true : false,
  // migrations: ['src/migrations/**/*{.ts,.js}'],

  logging: process.env.NODE_ENV === 'development' ? false : false,
  dropSchema: process.env.NODE_ENV === 'development' ? false : false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
