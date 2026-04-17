import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

type PaidPlan = 'standard' | 'premium';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const PRICE_IDS: Record<PaidPlan, string> = {
  standard: process.env.STRIPE_PRICE_STANDARD as string,
  premium: process.env.STRIPE_PRICE_PREMIUM as string,
};

function getAppUrl(req: VercelRequest): string {
  return (
    process.env.APP_URL ||
    `https://${req.headers.host}`
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (!accessToken) {
      return res.status(401).json({ error: 'Missing access token' });
    }

    const { plan } = req.body as { plan?: PaidPlan };

    if (!plan || !PRICE_IDS[plan]) {
      return res.status(400).json({ error: 'Invalid plan selection' });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid user session' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email, plan, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Prevent accidental same-tier repurchase.
    if (profile.plan === plan) {
      return res.status(409).json({
        error: `You already have the ${plan} plan.`,
      });
    }

    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email || undefined,
        metadata: {
          user_id: user.id,
        },
      });

      stripeCustomerId = customer.id;

      const { error: updateCustomerError } = await supabaseAdmin
        .from('profiles')
        .update({
          stripe_customer_id: stripeCustomerId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateCustomerError) {
        console.error('Failed to store Stripe customer ID:', updateCustomerError);
        return res.status(500).json({ error: 'Failed to prepare checkout' });
      }
    }

    const appUrl = getAppUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?canceled=1`,
      metadata: {
        user_id: user.id,
        plan,
      },
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error('create-checkout-session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}