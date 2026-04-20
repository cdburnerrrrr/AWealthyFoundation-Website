export type UserPlan = 'free' | 'standard' | 'premium';

export type Entitlements = {
  canViewFullReport: boolean;
  canDownloadPdf: boolean;
  canViewStandardDashboardFeatures: boolean;
  canViewPremiumDashboardFeatures: boolean;
  canUseWhatIfCalculator: boolean;
  canViewPremiumGuidance: boolean;
  canRunAssessment: boolean;
};

export function getEntitlements(
  plan: UserPlan,
  isActive: boolean
): Entitlements {
  const isPaid = plan === 'standard' || plan === 'premium';

  return {
    canViewFullReport: isPaid,
    canDownloadPdf: isPaid,
    canViewStandardDashboardFeatures: isPaid,
    canViewPremiumDashboardFeatures: plan === 'premium',
    canUseWhatIfCalculator: plan === 'premium',
    canViewPremiumGuidance: plan === 'premium',

    // 🔥 NEW (most important)
    canRunAssessment: isPaid && isActive,
  };
}