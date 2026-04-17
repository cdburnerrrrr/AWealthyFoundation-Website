import { supabase } from './supabase';

export type PlanTier = 'free' | 'standard' | 'premium';

export type TrackEventInput = {
  eventName: string;
  eventCategory?: string;
  pagePath?: string;
  plan?: PlanTier;
  userId?: string | null;
  assessmentId?: string | null;
  properties?: Record<string, unknown>;
};

const SESSION_STORAGE_KEY = 'awf_session_id';
const TRACKING_ENABLED = false;

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const created =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

function safeProps(input?: Record<string, unknown>): Record<string, unknown> {
  if (!input) return {};

  try {
    return JSON.parse(JSON.stringify(input));
  } catch {
    return {};
  }
}

export async function trackEvent({
  eventName,
  eventCategory,
  pagePath,
  plan,
  userId,
  assessmentId,
  properties,
}: TrackEventInput): Promise<void> {
  const payload = {
    user_id: userId ?? null,
    session_id: getSessionId(),
    event_name: eventName,
    event_category: eventCategory ?? null,
    page_path:
      pagePath ??
      (typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : null),
    plan: plan ?? 'free',
    assessment_id: assessmentId ?? null,
    properties: safeProps(properties),
  };

  // TEMP SAFETY MODE:
  // Tracking is disabled until analytics_events exists and Supabase insert rules are ready.
  // This prevents auth-token lock contention and console spam during login / hydration.
  if (!TRACKING_ENABLED) {
    if (typeof window !== 'undefined') {
      const key = '__awf_tracking_disabled_logged__';
      if (!(window as any)[key]) {
        console.info('A Wealthy Foundation tracking is temporarily disabled.');
        (window as any)[key] = true;
      }
    }
    return;
  }

  try {
    if (!payload.user_id) return;

    const { error } = await supabase.from('analytics_events').insert(payload);

    if (error) {
      console.warn('trackEvent skipped:', error.message);
    }
  } catch (error) {
    console.warn('trackEvent skipped:', error);
  }
}
