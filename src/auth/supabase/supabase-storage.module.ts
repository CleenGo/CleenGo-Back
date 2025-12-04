// src/auth/supabase/supabase-storage.module.ts
import { Module } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_STORAGE_CLIENT = 'SUPABASE_STORAGE_CLIENT';

@Module({
  providers: [
    {
      provide: SUPABASE_STORAGE_CLIENT,
      useFactory: (): SupabaseClient => {
        const url = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !serviceKey) {
          throw new Error(
            'SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configurados para STORAGE',
          );
        }

        return createClient(url, serviceKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        });
      },
    },
  ],
  exports: [SUPABASE_STORAGE_CLIENT],
})
export class SupabaseStorageModule {}
