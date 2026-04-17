// src/lib/entitlements.ts
export type UserPlan = 'free' | 'standard' | 'premium';

export type Entitlements = {
  canViewFullReport: boolean;
  canDownloadPdf: boolean;
  canViewStandardDashboardFeatures: boolean;
  canViewPremiumDashboardFeatures: boolean;
  canUseWhatIfCalculator: boolean;
  canViewPremiumGuidance: boolean;
  canViewExpertHelpDetails: boolean;
};

export function getEntitlements(plan: UserPlan): Entitlements {
  return {
    canViewFullReport: plan === 'standard' || plan === 'premium',
    canDownloadPdf: plan === 'standard' || plan === 'premium',
    canViewStandardDashboardFeatures: plan === 'standard' || plan === 'premium',
    canViewPremiumDashboardFeatures: plan === 'premium',
    canUseWhatIfCalculator: plan === 'premium',
    canViewPremiumGuidance: plan === 'premium',
    canViewExpertHelpDetails: false, // keep generic for now
  };
}