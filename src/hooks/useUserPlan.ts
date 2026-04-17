import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import type { UserPlan } from '../lib/entitlements';

export function useUserPlan(): UserPlan {
  const profile = useAppStore((s) => s.profile);

  return useMemo(() => {
    if (profile?.plan === 'standard') return 'standard';
    if (profile?.plan === 'premium') return 'premium';
    return 'free';
  }, [profile?.plan]);
}