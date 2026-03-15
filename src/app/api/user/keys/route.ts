import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { generateApiKey } from '@/lib/api-keys';

export async function POST() {
  try {
    const supabase = createRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const key = await generateApiKey(user.id, `Key ${new Date().toLocaleDateString()}`);

    return NextResponse.json(key);
  } catch (error: any) {
    console.error('Create API Key Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
