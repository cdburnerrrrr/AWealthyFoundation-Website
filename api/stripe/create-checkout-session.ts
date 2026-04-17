import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  
});

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { plan } = req.body ?? {};

    if (!plan || !['standard', 'premium'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Missing auth token' });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const priceId =
      plan === 'premium'
        ? process.env.STRIPE_PRICE_PREMIUM
        : process.env.STRIPE_PRICE_STANDARD;

    if (!priceId) {
      return res.status(500).json({
        error: `Missing Stripe price env var for plan: ${plan}`,
      });
    }

    const rawAppUrl = req.headers.origin ?? process.env.APP_URL ?? '';
const appUrl = String(rawAppUrl).replace(/^"(.*)"$/, '$1').trim();

console.log('REQ ORIGIN:', req.headers.origin);
console.log('APP_URL ENV:', process.env.APP_URL);
console.log('APP_URL FINAL:', appUrl);

if (!appUrl || !/^https?:\/\//.test(appUrl)) {
  return res.status(500).json({
    error: `APP_URL is missing or invalid. Got: ${appUrl || 'undefined'}`,
  });
}


console.log('APP_URL RAW:', process.env.APP_URL);
console.log('REQ ORIGIN:', req.headers.origin);
console.log('APP_URL FINAL:', appUrl);

if (!appUrl || !/^https?:\/\//.test(appUrl)) {
  return res.status(500).json({
    error: `APP_URL is missing or invalid. Got: ${appUrl || 'undefined'}`,
  });
}
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/my-foundation?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancel`,
      metadata: {
        plan,
        userId: user.id,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);

    const message =
      err?.raw?.message ||
      err?.message ||
      err?.userMessage ||
      'Checkout failed';

    return res.status(err?.statusCode || 500).json({ error: message });
  }
}