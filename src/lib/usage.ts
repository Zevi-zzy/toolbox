import { createServerClient } from '@/lib/supabase-server';

export const MAX_FREE_USAGE = 500;
export const MAX_PRO_USAGE = 1000;

export async function checkUsage(userId: string) {
  const supabase = createServerClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('usage_count, is_pro, tier')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('Error fetching usage:', error);
    return { allowed: true, count: 0, limit: MAX_FREE_USAGE, tier: 'free' }; 
  }

  const limit = profile.is_pro || profile.tier === 'pro' ? MAX_PRO_USAGE : MAX_FREE_USAGE;
  
  return {
    allowed: profile.usage_count < limit,
    count: profile.usage_count,
    limit,
    tier: profile.tier || (profile.is_pro ? 'pro' : 'free')
  };
}

export async function incrementUsage(userId: string) {
  const supabase = createServerClient();
  
  const { error } = await supabase.rpc('increment_usage', { user_id: userId });
  
  if (error) {
    console.error('Error incrementing usage:', error);
  }
}
