export type ReportTier = 'free' | 'standard' | 'premium';

export type ReportFeatureFlags = {
  showPdfButton: boolean;
  allowFullPdfExport: boolean;
  showPremiumGuidance: boolean;
  showWorkbookStylePrompts: boolean;
};

const DEV_SHOW_ALL =
    import.meta.env.VITE_SHOW_ALL_REPORT_FEATURES === 'true';

export function getReportTier(input?: string | null): ReportTier {
  if (!input) return 'free';

  const normalized = String(input).toLowerCase().trim();

  if (
    normalized === 'premium' ||
    normalized === '$79' ||
    normalized === '79' ||
    normalized === 'pro'
  ) {
    return 'premium';
  }

  if (
    normalized === 'standard' ||
    normalized === 'paid' ||
    normalized === '$29' ||
    normalized === '29' ||
    normalized === 'full'
  ) {
    return 'standard';
  }

  return 'free';
}

export function getReportFeatures(tier: ReportTier): ReportFeatureFlags {
  if (DEV_SHOW_ALL) {
    return {
      showPdfButton: true,
      allowFullPdfExport: true,
      showPremiumGuidance: true,
      showWorkbookStylePrompts: true,
    };
  }

  if (tier === 'premium') {
    return {
      showPdfButton: true,
      allowFullPdfExport: true,
      showPremiumGuidance: true,
      showWorkbookStylePrompts: true,
    };
  }

  if (tier === 'standard') {
    return {
      showPdfButton: true,
      allowFullPdfExport: true,
      showPremiumGuidance: false,
      showWorkbookStylePrompts: false,
    };
  }

  return {
    showPdfButton: true,
    allowFullPdfExport: false,
    showPremiumGuidance: false,
    showWorkbookStylePrompts: false,
  };
}

export function isDevReportOverrideEnabled(): boolean {
  return DEV_SHOW_ALL;
}