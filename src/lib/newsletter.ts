import { supabase } from './supabase';

export type NewsletterSignupSource = 'landing_page_home' | 'newsletter_page' | string;

type SubscribeToNewsletterInput = {
  email: string;
  name?: string;
  source?: NewsletterSignupSource;
};

type SubscribeToNewsletterResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  subscriptionId?: string;
};

function getFriendlyNewsletterError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export async function subscribeToNewsletter({
  email,
  name = '',
  source = 'website',
}: SubscribeToNewsletterInput) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanEmail) {
    throw new Error('Please enter your email address.');
  }

  const { data, error } = await supabase.functions.invoke<SubscribeToNewsletterResponse>(
    'subscribe-beehiiv',
    {
      body: {
        email: cleanEmail,
        name: cleanName,
        source,
      },
    }
  );

  if (error) {
    throw new Error(getFriendlyNewsletterError(error));
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}
