import { createServerClient } from './supabase-server';
import { crypto } from 'crypto';

export async function generateApiKey(userId: string, name: string = 'Default Key') {
  const supabase = createServerClient();
  const keyValue = `tk_${Buffer.from(crypto.randomBytes(24)).toString('hex')}`;
  
  const { data, error } = await supabase
    .from('api_keys')
    .insert([{ user_id: userId, key_value: keyValue, name }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function validateApiKey(keyValue: string) {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('user_id, profiles(tier, is_pro)')
    .eq('key_value', keyValue)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  // Update last used
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_value', keyValue);

  return {
    userId: data.user_id,
    tier: (data as any).profiles.tier,
    isPro: (data as any).profiles.is_pro
  };
}
