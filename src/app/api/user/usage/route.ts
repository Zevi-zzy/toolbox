import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { checkUsage } from '@/lib/usage';

export async function GET() {
  try {
    const supabase = createRouteClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count, allowed } = await checkUsage(session.user.id);

    return NextResponse.json({ count, allowed });
  } catch (error) {
    console.error('Get Usage API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
