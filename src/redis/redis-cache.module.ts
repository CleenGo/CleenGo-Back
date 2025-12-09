import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
     useFactory: () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.log('⚠ Redis deshabilitado localmente');
    return {
      get: async () => null,
      set: async () => null,
    };
  }
  
  const [host, port] = redisUrl.replace('redis://', '').split(':');

  return new Redis({
    host,
    port: Number(port),
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
}

    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}

