// src/config/typeorm.config.ts
//? Configuración de TypeORM para la conexión a la base de datos PostgreSQL.

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmOptions = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10), // para supabase puerto 6543
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,

  // dev: sincroniza; prod: usa migraciones
  synchronize: true,
  // migrations: ['src/migrations/**/*{.ts,.js}'],

  // Dejamos el logging como lo tenías para no cambiar comportamiento
  logging: process.env.NODE_ENV === 'development' ? false : false,
  dropSchema: process.env.NODE_ENV === 'development' ? false : false,

  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  /**
   * 👇 Configuración del pool de conexiones de `pg`
   * - max: Máximo de conexiones simultáneas (por defecto 10 si no defines env).
   * - idleTimeoutMillis: Después de cuánto tiempo una conexión inactiva se cierra.
   * - connectionTimeoutMillis: Tiempo máximo esperando una nueva conexión.
   * - keepAlive: Mantiene viva la conexión para evitar cortes inesperados.
   */
  extra: {
    max: Number(process.env.DB_MAX_CONNECTIONS ?? 10),
    idleTimeoutMillis: 10_000, // 10 segundos
    connectionTimeoutMillis: 5_000, // 5 segundos
    keepAlive: true,
  },
});
