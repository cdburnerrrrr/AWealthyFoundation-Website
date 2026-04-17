import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { trackEvent, type PlanTier } from '../lib/eventTracking';

type BaseProps = Record<string, unknown>;

export function useTrackEvent() {
  const location = useLocation();
  const { user, userPlan, currentAssessment } = useAppStore() as any;

  const resolvedPlan: PlanTier =
    userPlan === 'standard' || userPlan === 'premium' ? userPlan : 'free';

  const assessmentId =
    currentAssessment?.id != null ? String(currentAssessment.id) : null;

  const track = useCallback(
    async (
      eventName: string,
      properties?: BaseProps,
      eventCategory?: string
    ) => {
      await trackEvent({
        eventName,
        eventCategory,
        pagePath: location.pathname + location.search,
        plan: resolvedPlan,
        userId: user?.userId ?? user?.id ?? null,
        assessmentId,
        properties,
      });
    },
    [location.pathname, location.search, resolvedPlan, user, assessmentId]
  );

  const trackLockedFeature = useCallback(
    async (featureKey: string, source?: string) => {
      await track('feature_locked_viewed', { featureKey, source }, 'gating');
    },
    [track]
  );

  const trackUpgradeClick = useCallback(
    async (
      targetPlan: PlanTier,
      featureKey: string,
      source?: string
    ) => {
      await track(
        'upgrade_cta_clicked',
        { targetPlan, featureKey, source },
        'conversion'
      );
    },
    [track]
  );

  const trackTabViewed = useCallback(
    async (tabName: string, section: string) => {
      await track('tab_viewed', { tabName, section }, 'navigation');
    },
    [track]
  );

  return {
    track,
    trackLockedFeature,
    trackUpgradeClick,
    trackTabViewed,
  };
}