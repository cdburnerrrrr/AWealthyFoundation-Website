import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type SubscribeRequest = {
  email?: string;
  name?: string;
  source?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  try {
    const beehiivApiKey = Deno.env.get('BEEHIIV_API_KEY');
    const beehiivPublicationId = Deno.env.get('BEEHIIV_PUBLICATION_ID');

    if (!beehiivApiKey || !beehiivPublicationId) {
      return jsonResponse(
        { error: 'Newsletter signup is not configured yet.' },
        500
      );
    }

    const body = (await req.json().catch(() => ({}))) as SubscribeRequest;
    const email = (body.email ?? '').trim().toLowerCase();
    const name = (body.name ?? '').trim();
    const source = (body.source ?? 'website').trim() || 'website';

    if (!email || !isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
    }

    const firstName = name.split(' ').filter(Boolean)[0] ?? '';

    const beehiivPayload = {
      email,
      reactivate_existing: true,
      send_welcome_email: true,
      utm_source: 'awealthyfoundation.com',
      utm_medium: 'website',
      utm_campaign: 'foundation_report_signup',
      utm_content: source,
      referring_site: req.headers.get('origin') ?? 'https://www.awealthyfoundation.com',
      ...(firstName
        ? {
            custom_fields: [
              {
                name: 'First Name',
                value: firstName,
              },
            ],
          }
        : {}),
    };

    const beehiivResponse = await fetch(
      `https://api.beehiiv.com/v2/publications/${beehiivPublicationId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${beehiivApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(beehiivPayload),
      }
    );

    const responseText = await beehiivResponse.text();
    let beehiivData: Record<string, unknown> | null = null;

    try {
      beehiivData = responseText ? JSON.parse(responseText) : null;
    } catch {
      beehiivData = null;
    }

    if (!beehiivResponse.ok) {
      console.error('Beehiiv signup failed:', beehiivResponse.status, responseText);

      return jsonResponse(
        {
          error:
            'We could not subscribe you right now. Please try again in a minute.',
        },
        beehiivResponse.status >= 500 ? 502 : 400
      );
    }

    const subscription = beehiivData?.data as { id?: string } | undefined;

    return jsonResponse({
      success: true,
      message: 'Subscribed successfully.',
      subscriptionId: subscription?.id ?? null,
    });
  } catch (error) {
    console.error('Newsletter signup error:', error);

    return jsonResponse(
      { error: 'Something went wrong. Please try again.' },
      500
    );
  }
});
