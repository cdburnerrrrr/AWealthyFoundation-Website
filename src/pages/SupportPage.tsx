import { Link } from 'react-router-dom';
import { Mail, HelpCircle, FileText, ShieldCheck, ArrowRight, Download } from 'lucide-react';

const SUPPORT_EMAIL = 'support@awealthyfoundation.com';

export default function SupportPage() {
  return (
    <div className="bg-slate-50 text-navy-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 px-6 py-20 text-white">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-copper-500 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-cyan-400 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-copper-300/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-copper-200">
            <HelpCircle size={15} /> Support
          </div>
          <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl">
            Need help with A Wealthy Foundation?
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
            Use this page for questions about your account, purchase, workbook download, Foundation Report, Dashboard, or site tools.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-copper-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-copper-950/20 transition hover:bg-copper-600"
            >
              Email Support <Mail size={17} />
            </a>
            <Link
              to="/workbook"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              Workbook Download <Download size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-navy-950">Contact support</h2>
            <p className="mt-3 leading-7 text-slate-700">
              The best way to reach A Wealthy Foundation is by email. Include the email address used for your account or purchase so we can look up the right record.
            </p>

            <div className="mt-6 rounded-2xl border border-copper-200 bg-copper-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper-700">Support email</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-navy-950 hover:text-copper-700">
                {SUPPORT_EMAIL} <ArrowRight size={18} />
              </a>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ['Account access', 'Login, confirmation email, password, or dashboard access questions.'],
                ['Purchases', 'Questions about the $29 Foundation Assessment Plan or $79 Foundation Roadmap Plan.'],
                ['Downloads', 'Help accessing the free workbook or PDF files.'],
                ['Reports and tools', 'Questions about the Foundation Score, report, Dashboard, or calculators.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-bold text-navy-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-navy-50 p-3 text-navy-700">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-navy-950">Educational resource only</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    A Wealthy Foundation is designed for general education and clarity. It does not provide personal financial, investment, tax, legal, insurance, or accounting advice.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-copper-50 p-3 text-copper-700">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-navy-950">Helpful links</h2>
                  <div className="mt-4 space-y-3 text-sm font-semibold">
                    <Link to="/privacy" className="block text-navy-700 hover:text-copper-700">Privacy Policy</Link>
                    <Link to="/terms" className="block text-navy-700 hover:text-copper-700">Terms of Service</Link>
                    <Link to="/pricing" className="block text-navy-700 hover:text-copper-700">Plans and Pricing</Link>
                    <Link to="/foundation-tools" className="block text-navy-700 hover:text-copper-700">Foundation Tools</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
