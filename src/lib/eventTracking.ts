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
const MAX_PROPERTY_DEPTH = 4;
const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_ITEMS = 25;
const SENSITIVE_KEY_PATTERN =
  /(password|passcode|token|secret|key|email|name|phone|address|ssn|social|income|salary|balance|debt|asset|mortgage|rent|payment|answer|responses)/i;

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

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (value == null) return value;

  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}…`
      : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    if (depth >= MAX_PROPERTY_DEPTH) return '[array]';
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeValue(item, depth + 1));
  }

  if (typeof value === 'object') {
    if (depth >= MAX_PROPERTY_DEPTH) return '[object]';

    const output: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) continue;
      output[key] = sanitizeValue(nestedValue, depth + 1);
    }

    return output;
  }

  return String(value);
}

function safeProps(input?: Record<string, unknown>): Record<string, unknown> {
  if (!input) return {};

  try {
    const sanitized = sanitizeValue(input);
    return sanitized && typeof sanitized === 'object' && !Array.isArray(sanitized)
      ? (sanitized as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function getPagePath(pagePath?: string): string | null {
  if (pagePath) return pagePath;

  if (typeof window === 'undefined') return null;

  return window.location.pathname + window.location.search;
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
  const cleanEventName = eventName.trim();
  if (!cleanEventName) return;

  const payload = {
    user_id: userId ?? null,
    session_id: getSessionId(),
    event_name: cleanEventName,
    event_category: eventCategory ?? null,
    page_path: getPagePath(pagePath),
    plan: plan ?? 'free',
    assessment_id: assessmentId ?? null,
    properties: safeProps(properties),
  };

  try {
    const { error } = await supabase.from('analytics_events').insert(payload);

    if (error && import.meta.env.DEV) {
      console.warn('trackEvent skipped:', error.message);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('trackEvent skipped:', error);
    }
  }
}
