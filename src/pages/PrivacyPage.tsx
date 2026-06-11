import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

const SUPPORT_EMAIL = 'support@awealthyfoundation.com';

const sections = [
  {
    title: 'Information we collect',
    body: [
      'Account information, such as your email address and login details when you create an account.',
      'Assessment and dashboard information that you choose to enter, such as financial categories, goals, responses, and planning inputs.',
      'Purchase information needed to process access to paid plans. Payment card details are handled by Stripe, not stored by A Wealthy Foundation.',
      'Website usage information, such as pages viewed, plan status, and basic analytics events used to understand and improve the site.',
      'Newsletter or email signup information when you choose to subscribe.',
    ],
  },
  {
    title: 'How we use information',
    body: [
      'To provide the Foundation Score, reports, dashboard, tools, workbook downloads, and paid plan access.',
      'To save your progress, show your account status, and improve the usefulness of the site.',
      'To process purchases, confirm access, respond to support requests, and send account-related messages.',
      'To send newsletter updates only when you choose to subscribe.',
    ],
  },
  {
    title: 'Third-party services',
    body: [
      'Supabase is used for authentication, database storage, and account-related services.',
      'Stripe is used to process payments and manage checkout.',
      'Resend may be used to send account or authentication emails.',
      'Beehiiv may be used for newsletter subscriptions and newsletter delivery.',
      'Vercel is used to host and deliver the website.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'You can choose not to create an account, though some features require one.',
      'You can unsubscribe from newsletter emails using the unsubscribe link in those emails.',
      'You can contact support to ask about your account data or request account-related help.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="w-full overflow-x-hidden bg-slate-50 text-navy-900">
      <section className="border-b border-slate-200 bg-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-copper-200 bg-copper-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
            <ShieldCheck size={15} /> Privacy Policy
          </div>
          <h1 className="font-serif text-3xl font-bold leading-tight text-navy-950 sm:text-5xl">Privacy Policy</h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            This policy explains how A Wealthy Foundation collects, uses, and protects information connected to the website, assessments, dashboard, tools, paid reports, workbook downloads, and newsletter.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-500">Last updated: June 10, 2026</p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="min-w-0 rounded-3xl border border-copper-200 bg-copper-50 p-5 sm:p-6">
            <div className="flex gap-3">
              <div className="mt-1 rounded-2xl bg-white p-3 text-copper-700 shadow-sm">
                <Lock size={22} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-navy-950">Private by default</h2>
                <p className="mt-2 leading-7 text-slate-700">
                  Your financial assessment answers are used to provide your score, report, dashboard, and tools. They are not sold to advertisers.
                </p>
              </div>
            </div>
          </div>

          {sections.map((section) => (
            <section key={section.title} className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-serif text-2xl font-bold text-navy-950">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-slate-700">
                {section.body.map((item) => (
                  <li key={item} className="flex gap-3 leading-7">
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-serif text-2xl font-bold text-navy-950">Security and retention</h2>
            <p className="mt-4 break-words leading-7 text-slate-700">
              A Wealthy Foundation uses reasonable administrative, technical, and organizational safeguards to protect account and website data. No online system can be guaranteed completely secure. We keep information as long as needed to provide services, comply with legal or operational needs, improve the site, and maintain account history unless deletion is requested and legally permissible.
            </p>
          </section>

          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-serif text-2xl font-bold text-navy-950">Contact</h2>
            <p className="mt-4 break-words leading-7 text-slate-700">
              For privacy questions or account help, email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="break-all font-bold text-copper-700 hover:text-copper-800">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <Link to="/support" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-navy-700 hover:border-copper-300 hover:text-copper-700">
                Support <Mail size={15} />
              </Link>
              <Link to="/terms" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-navy-700 hover:border-copper-300 hover:text-copper-700">
                Terms of Service
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
