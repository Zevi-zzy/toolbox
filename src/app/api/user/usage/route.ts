import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { checkUsage } from '@/lib/usage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count, allowed, limit, tier } = await checkUsage(user.id);

    return NextResponse.json({ count, allowed, limit, tier, isPro: tier === 'pro' });
  } catch (error) {
    console.error('Get Usage API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
