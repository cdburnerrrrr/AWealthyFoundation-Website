import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  Download,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

const workbookPdfUrl = '/downloads/The-Wealthy-Foundation-Workbook.pdf';
const workbookCoverUrl = '/downloads/wealthy-foundation-workbook-cover.png';

export default function WorkbookPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <section className="overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-copper-600">
              Free companion resource
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-navy-900 sm:text-5xl lg:text-6xl">
              The Wealthy Foundation Workbook
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-navy-600">
              A practical companion for readers of <em>A Wealthy Foundation</em>. Use it to slow down,
              look honestly at your numbers, find the pressure, and choose your next right move.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={workbookPdfUrl}
                download
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-copper-600 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-copper-700"
              >
                <Download className="h-5 w-5" />
                Download the Free Workbook
              </a>

              <Link
                to="/assessment/snapshot"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-copper-300 bg-white px-6 text-sm font-semibold text-copper-700 transition hover:bg-copper-50"
              >
                Take the Free Foundation Snapshot
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <p className="mt-4 text-sm leading-6 text-navy-500">
              No purchase required. No email required. Print a fresh copy whenever you want to review your foundation again.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <BookOpen className="mb-3 h-6 w-6 text-copper-600" />
                <p className="text-sm font-semibold text-navy-900">Book companion</p>
                <p className="mt-1 text-sm leading-6 text-navy-600">Use it alongside the story or on its own.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <ClipboardCheck className="mb-3 h-6 w-6 text-copper-600" />
                <p className="text-sm font-semibold text-navy-900">Hands-on worksheets</p>
                <p className="mt-1 text-sm leading-6 text-navy-600">Write down real numbers and pressure points.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <RefreshCw className="mb-3 h-6 w-6 text-copper-600" />
                <p className="text-sm font-semibold text-navy-900">Use it again</p>
                <p className="mt-1 text-sm leading-6 text-navy-600">Come back in six months and update your plan.</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <div className="absolute -inset-6 rounded-[2rem] bg-copper-100/60 blur-3xl" />
            <div className="relative rounded-[1.75rem] border border-copper-200 bg-white p-4 shadow-xl">
              <div className="relative min-h-[420px] overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-600">
                    The Wealthy Foundation
                  </p>
                  <p className="mt-3 font-serif text-3xl font-bold text-navy-900">Workbook</p>
                  <p className="mt-3 text-sm leading-6 text-navy-600">
                    Reflect. Plan. Build. Move forward.
                  </p>
                </div>
                <img
                  src={workbookCoverUrl}
                  alt="The Wealthy Foundation Workbook cover"
                  className="relative z-10 h-auto w-full bg-white"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="font-serif text-3xl font-bold text-navy-900">What the workbook helps you do</h2>
            <p className="mt-3 max-w-3xl text-navy-600 leading-7">
              The workbook turns the seven building blocks into written reflection, simple worksheets,
              and a 30/60/90-day plan. It is designed to help you see the structure underneath your
              financial life without shame or overwhelm.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                'Review your Foundation Score and first reaction.',
                'Complete a three-month checkup of real spending patterns.',
                'List fixed obligations, debt pressure, and money leaks.',
                'Walk through Income, Spending, Saving, Investing, Debt, Protection, and Vision.',
                'Use college, car, and house worksheets before major decisions.',
                'Choose one next right move and turn it into a 30/60/90-day plan.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-copper-600" />
                  <p className="text-sm leading-6 text-navy-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-copper-200 bg-copper-50 p-6 shadow-sm">
            <ShieldCheck className="h-8 w-8 text-copper-700" />
            <h3 className="mt-4 text-xl font-bold text-navy-900">Private by default</h3>
            <p className="mt-3 text-sm leading-6 text-navy-700">
              This is a downloadable PDF. You can print it, save it, or work through it privately. The website is optional
              when you want interactive tools, your Foundation Score, or a dashboard.
            </p>
            <a
              href={workbookPdfUrl}
              download
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              Download PDF
              <Download className="h-4 w-4" />
            </a>
          </aside>
        </div>
      </section>

      <section className="bg-navy-900 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper-300">Keep building</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Want the interactive companion too?</h2>
            <p className="mt-3 max-w-2xl text-navy-200 leading-7">
              Start with the free Foundation Snapshot, then use the dashboard, calculators, and report tools when you want a deeper view.
            </p>
          </div>
          <Link
            to="/assessment/snapshot"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-copper-500 px-6 text-sm font-semibold text-white transition hover:bg-copper-600"
          >
            Take the Free Snapshot
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
