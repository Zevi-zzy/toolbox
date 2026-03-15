import { createServerClient } from '@/lib/supabase-server';

export const MAX_FREE_USAGE = 10;

export async function checkUsage(userId: string) {
  const supabase = createServerClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('usage_count, is_pro')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('Error fetching usage:', error);
    return { allowed: true, count: 0 }; 
  }

  if (profile.is_pro) return { allowed: true, count: profile.usage_count };
  
  return {
    allowed: profile.usage_count < MAX_FREE_USAGE,
    count: profile.usage_count
  };
}

export async function incrementUsage(userId: string) {
  const supabase = createServerClient();
  
  const { error } = await supabase.rpc('increment_usage', { user_id: userId });
  
  if (error) {
    console.error('Error incrementing usage:', error);
  }
}
