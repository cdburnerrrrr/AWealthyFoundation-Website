import { supabase } from './supabase';

export async function startCheckout(plan: 'standard' | 'premium') {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error('You must be logged in to upgrade.');
  }

  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ plan }),
  });

  const text = await response.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `Checkout failed (${response.status}): ${text || 'Invalid server response'}`
    );
  }

  if (!response.ok) {
    throw new Error(data?.error || `Checkout failed (${response.status})`);
  }

  if (!data?.url) {
    throw new Error('Stripe checkout URL was not returned.');
  }

  window.location.href = data.url;
}