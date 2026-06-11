import { Link } from 'react-router-dom';
import { FileText, ShieldAlert, RefreshCcw, Mail } from 'lucide-react';

const SUPPORT_EMAIL = 'support@awealthyfoundation.com';

const sections = [
  {
    title: 'Educational use only',
    body: 'A Wealthy Foundation provides general educational and informational resources. The book, workbook, Foundation Score, reports, dashboard, articles, tools, and newsletter are not financial, investment, tax, legal, insurance, accounting, or professional advice. You are responsible for your own decisions and should consult qualified professionals where appropriate.',
  },
  {
    title: 'Accounts and access',
    body: 'Some features require an account. You are responsible for keeping your login information secure and for entering accurate information when using the assessment, dashboard, and tools. Paid plans may unlock reports, PDF access, dashboard features, roadmap guidance, or related digital resources according to the plan selected.',
  },
  {
    title: 'Paid plans',
    body: 'A Wealthy Foundation currently offers one-time purchase plans, including the Foundation Assessment Plan and Foundation Roadmap Plan. Access terms, features, and pricing may change over time, but any purchase should be governed by the terms presented at checkout and on the website at the time of purchase.',
  },
  {
    title: 'Refunds and guarantee',
    body: 'If you purchased a paid plan and are not satisfied, contact support within 30 days of purchase. We will review the request and may issue a refund consistent with the money-back guarantee presented on the site. Stripe payment processing fees and timing may affect how refunds appear through your bank or card issuer.',
  },
  {
    title: 'No guaranteed results',
    body: 'The Foundation Score and related tools are designed to help you see patterns, pressure points, and possible next moves. They do not guarantee improved finances, investment results, debt reduction, credit outcomes, income increases, or any specific result.',
  },
  {
    title: 'Acceptable use',
    body: 'Do not misuse the website, attempt unauthorized access, interfere with the service, copy or resell paid materials, or use the site in a way that violates law or harms other users. We may limit or terminate access if the service is abused.',
  },
  {
    title: 'Intellectual property',
    body: 'A Wealthy Foundation materials, including text, workbook content, reports, tools, branding, and related resources, are owned by Mark A. Williams or A Wealthy Foundation unless otherwise noted. You may use them for personal educational purposes, but may not reproduce, sell, or distribute them as your own.',
  },
  {
    title: 'Changes to the service or terms',
    body: 'We may update the website, features, pricing, policies, and these terms over time. Continued use of the website after updates means you accept the revised terms.',
  },
];

export default function TermsPage() {
  return (
    <div className="w-full overflow-x-hidden bg-slate-50 text-navy-900">
      <section className="border-b border-slate-200 bg-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-copper-200 bg-copper-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
            <FileText size={15} /> Terms of Service
          </div>
          <h1 className="font-serif text-3xl font-bold leading-tight text-navy-950 sm:text-5xl">Terms of Service</h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            These terms explain the basic rules for using A Wealthy Foundation, including the website, assessment, reports, dashboard, tools, workbook downloads, and related resources.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-500">Last updated: June 10, 2026</p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="min-w-0 rounded-3xl border border-copper-200 bg-copper-50 p-5 sm:p-6">
            <div className="flex gap-3">
              <div className="mt-1 rounded-2xl bg-white p-3 text-copper-700 shadow-sm">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-navy-950">Important disclaimer</h2>
                <p className="mt-2 leading-7 text-slate-700">
                  This site helps you think clearly about money. It does not replace a qualified financial planner, tax professional, attorney, insurance professional, accountant, lender, benefits department, or other professional adviser.
                </p>
              </div>
            </div>
          </div>

          {sections.map((section) => (
            <section key={section.title} className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-serif text-2xl font-bold text-navy-950">{section.title}</h2>
              <p className="mt-4 break-words leading-7 text-slate-700">{section.body}</p>
            </section>
          ))}

          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-serif text-2xl font-bold text-navy-950">Contact and support</h2>
            <p className="mt-4 break-words leading-7 text-slate-700">
              Questions about your account, access, purchase, or these terms can be sent to{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="break-all font-bold text-copper-700 hover:text-copper-800">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <Link to="/support" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-navy-700 hover:border-copper-300 hover:text-copper-700">
                Support <Mail size={15} />
              </Link>
              <Link to="/privacy" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-navy-700 hover:border-copper-300 hover:text-copper-700">
                Privacy Policy
              </Link>
            </div>
          </section>

          <div className="rounded-3xl bg-navy-950 p-7 text-white">
            <div className="flex items-start gap-3">
              <RefreshCcw className="mt-1 text-copper-300" size={23} />
              <div>
                <h2 className="font-serif text-2xl font-bold">Keep building</h2>
                <p className="mt-3 leading-7 text-slate-200">
                  Use the book, workbook, Foundation Score, and dashboard as tools for clarity. They are designed to help you see pressure, strengthen one building block at a time, and choose the next right move.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
