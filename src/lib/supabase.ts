import { createClientComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Client-side client
export const createClient = () => createClientComponentClient();

// Route Handler client (for Auth in API routes)
export const createRouteClient = () => createRouteHandlerClient({ cookies });

// Server-side client (for Service Role bypass RLS in API routes)
export const createServerClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};
