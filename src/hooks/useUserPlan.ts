import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';

export type UserPlan = 'free' | 'standard' | 'premium';

export function useUserPlan() {
  const profile = useAppStore((s) => s.profile);

  return useMemo(() => {
    const plan: UserPlan =
      profile?.plan === 'standard'
        ? 'standard'
        : profile?.plan === 'premium'
        ? 'premium'
        : 'free';

    const expiresAt = profile?.plan_expires_at
      ? new Date(profile.plan_expires_at)
      : null;

    const isActive =
      plan !== 'free' &&
      expiresAt &&
      expiresAt > new Date();

    return {
      plan,
      isActive,
      expiresAt,
    };
  }, [profile]);
}