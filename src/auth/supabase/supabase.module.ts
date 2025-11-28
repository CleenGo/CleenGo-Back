import { Module } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,

      useFactory: (): SupabaseClient => {
        const url = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !serviceKey) {
          throw new Error(
            'SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configurados',
          );
        }

        return createClient(url, serviceKey);
      },
    },
  ],

  exports: [SUPABASE_CLIENT],
})
export class SupabaseModule {}
