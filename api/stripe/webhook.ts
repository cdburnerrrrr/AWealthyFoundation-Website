import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

async function updateProfilePlan(args: {
  userId: string;
  plan: 'standard' | 'premium';
  stripeCustomerId?: string | null;
  stripeSessionId?: string | null;
}) {
  const { userId, plan, stripeCustomerId, stripeSessionId } = args;

  const updatePayload = {
    plan,
    stripe_customer_id: stripeCustomerId ?? null,
    stripe_checkout_last_session_id: stripeSessionId ?? null,
    updated_at: new Date().toISOString(),
  };

  // Try profiles.id = auth user id first
  const firstAttempt = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId)
    .select('id')
    .limit(1);

  if (!firstAttempt.error && firstAttempt.data && firstAttempt.data.length > 0) {
    return;
  }

  // Fallback if your profiles table uses user_id instead of id
  const secondAttempt = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('user_id', userId)
    .select('id')
    .limit(1);

  if (secondAttempt.error) {
    throw secondAttempt.error;
  }

  if (!secondAttempt.data || secondAttempt.data.length === 0) {
    throw new Error(`No profile row found for user ${userId}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Missing STRIPE_WEBHOOK_SECRET' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await readRawBody(req);

    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error?.message || error);
    return res.status(400).json({
      error: `Webhook Error: ${error?.message || 'Invalid signature'}`,
    });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const plan = session.metadata?.plan;
const userId = session.metadata?.userId;

        if (!plan || (plan !== 'standard' && plan !== 'premium')) {
          throw new Error('Missing or invalid plan in session metadata');
        }

        if (!userId) {
          throw new Error('Missing user_id in session metadata');
        }

        await updateProfilePlan({
          userId,
          plan,
          stripeCustomerId:
            typeof session.customer === 'string' ? session.customer : null,
          stripeSessionId: session.id,
        });

        console.log('Profile upgraded from checkout.session.completed:', {
          userId,
          plan,
          sessionId: session.id,
        });

        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;

        const plan = session.metadata?.plan;
        const userId = session.metadata?.user_id;

        if (!plan || (plan !== 'standard' && plan !== 'premium')) {
          throw new Error('Missing or invalid plan in async payment metadata');
        }

        if (!userId) {
          throw new Error('Missing user_id in async payment metadata');
        }

        await updateProfilePlan({
          userId,
          plan,
          stripeCustomerId:
            typeof session.customer === 'string' ? session.customer : null,
          stripeSessionId: session.id,
        });

        console.log('Profile upgraded from async payment success:', {
          userId,
          plan,
          sessionId: session.id,
        });

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler failed:', error);
    return res.status(500).json({
      error: error?.message || 'Webhook handler failed',
    });
  }
}