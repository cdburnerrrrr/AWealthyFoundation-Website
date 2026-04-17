import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/appStore';

type UserPlan = 'free' | 'standard' | 'premium';

function normalizePlan(plan: string | null | undefined): UserPlan {
  if (plan === 'standard') return 'standard';
  if (plan === 'premium') return 'premium';
  return 'free';
}

export function useHydrateProfile() {
  const { setUser, setProfile, setUserPlan, setPremium, setAuth } = useAppStore();

  useEffect(() => {
    let isMounted = true;

    async function hydrate(session: any) {
      try {
        if (!session?.user) {
          if (!isMounted) return;
          setUser(null);
          setProfile(null);
          setUserPlan('free');
          setPremium(false);
          setAuth(false, false);
          return;
        }

        const user = session.user;

        const { data: profileRows, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          console.error('Profile load error:', error);
        }

        let resolvedProfile = profileRows?.[0] ?? null;

        if (!resolvedProfile) {
          const fallbackProfile = {
            user_id: user.id,
            email: user.email ?? null,
            plan: 'free' as UserPlan,
          };

          const { data: insertedRows, error: insertError } = await supabase
            .from('profiles')
            .insert(fallbackProfile)
            .select()
            .limit(1);

          if (insertError) {
            console.error('Profile create error:', insertError);
            resolvedProfile = fallbackProfile;
          } else {
            resolvedProfile = insertedRows?.[0] ?? fallbackProfile;
          }
        }

        const plan = normalizePlan(resolvedProfile?.plan);

        if (!isMounted) return;

        setUser(user);
        setProfile(resolvedProfile);
        setUserPlan(plan);
        setPremium(plan === 'premium');
        setAuth(true, false);
      } catch (error) {
        console.error('Hydration failed:', error);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrate(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setUserPlan, setPremium, setAuth]);
}
