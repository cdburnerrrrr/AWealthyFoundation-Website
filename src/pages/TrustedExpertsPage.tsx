import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Calculator,
  CheckCircle2,
  Home,
  Landmark,
  ScrollText,
  Shield,
  TrendingUp,
} from 'lucide-react';

type ExpertKind =
  | 'planner'
  | 'cpa'
  | 'insurance'
  | 'attorney'
  | 'realtor'
  | 'retirement';

type ExpertCardProps = {
  title: string;
  subtitle: string;
  reason: string;
  bullets: string[];
  cta: string;
  kind: ExpertKind;
};

function ExpertImage({ kind }: { kind: ExpertKind }) {
  const config = {
    planner: {
      title: 'Financial Planner',
      bgFrom: '#17365d',
      bgTo: '#2f5f95',
      accent: '#d18a3a',
      icon: '📈',
      detail: 'Strategy • Planning • Guidance',
    },
    cpa: {
      title: 'CPA / Tax',
      bgFrom: '#1f5a52',
      bgTo: '#2f8679',
      accent: '#d18a3a',
      icon: '🧾',
      detail: 'Tax • Audit • Strategy',
    },
    insurance: {
      title: 'Insurance Review',
      bgFrom: '#51408f',
      bgTo: '#7658c7',
      accent: '#d18a3a',
      icon: '🛡️',
      detail: 'Life • Disability • Protection',
    },
    attorney: {
      title: 'Will & Trust',
      bgFrom: '#6a3f1f',
      bgTo: '#b6702d',
      accent: '#f4d7b6',
      icon: '⚖️',
      detail: 'Legacy • Estate • Family',
    },
    realtor: {
      title: 'Trusted Realtor',
      bgFrom: '#0f5e73',
      bgTo: '#1d8ea9',
      accent: '#d18a3a',
      icon: '🏠',
      detail: 'Housing • Fit • Affordability',
    },
    retirement: {
      title: 'Retirement',
      bgFrom: '#7a4a13',
      bgTo: '#d18a3a',
      accent: '#f4d7b6',
      icon: '🧭',
      detail: 'Income • Timing • Security',
    },
  }[kind];

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-[#d7e3f0] bg-[#f8fbff]">
      <svg viewBox="0 0 800 400" className="h-full w-full">
        <defs>
          <linearGradient id={`bg-${kind}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={config.bgFrom} />
            <stop offset="100%" stopColor={config.bgTo} />
          </linearGradient>
          <linearGradient id={`overlay-${kind}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.18)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="800" height="400" fill={`url(#bg-${kind})`} />
        <circle cx="690" cy="65" r="120" fill="rgba(255,255,255,0.08)" />
        <circle cx="120" cy="320" r="100" fill="rgba(255,255,255,0.06)" />
        <rect x="0" y="0" width="800" height="400" fill={`url(#overlay-${kind})`} />

        {/* Desk */}
        <rect x="0" y="290" width="800" height="110" fill="rgba(255,255,255,0.10)" />
        <rect x="0" y="315" width="800" height="85" fill="rgba(15,23,42,0.14)" />

        {/* Main card/paper */}
        <rect x="82" y="88" rx="16" ry="16" width="360" height="184" fill="rgba(255,255,255,0.96)" />
        <rect x="98" y="108" rx="10" ry="10" width="328" height="32" fill={config.accent} opacity="0.22" />
        <text x="260" y="130" textAnchor="middle" fontSize="26" fontWeight="700" fill="#17365d">
          {config.title}
        </text>
        <text x="260" y="178" textAnchor="middle" fontSize="54">
          {config.icon}
        </text>
        <text x="260" y="228" textAnchor="middle" fontSize="18" fontWeight="600" fill="#5d6b7a">
          {config.detail}
        </text>

        {/* Support props */}
        <rect x="525" y="88" rx="12" ry="12" width="165" height="120" fill="rgba(255,255,255,0.18)" />
        <rect x="548" y="115" rx="8" ry="8" width="122" height="12" fill="rgba(255,255,255,0.40)" />
        <rect x="548" y="140" rx="8" ry="8" width="96" height="12" fill="rgba(255,255,255,0.25)" />
        <rect x="548" y="165" rx="8" ry="8" width="110" height="12" fill="rgba(255,255,255,0.25)" />

        <rect x="500" y="250" rx="14" ry="14" width="180" height="34" fill="rgba(255,255,255,0.90)" />
        <text x="590" y="272" textAnchor="middle" fontSize="18" fontWeight="700" fill="#17365d">
          Trusted Support
        </text>
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-[#17365d]/40 via-transparent to-transparent" />
    </div>
  );
}

function ExpertCard({ title, subtitle, reason, bullets, cta, kind }: ExpertCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#d7e3f0] bg-white shadow-sm">
      <div className="p-5">
        <ExpertImage kind={kind} />
      </div>

      <div className="px-5 pb-5">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-navy-900">{title}</h3>
          <p className="mt-1 text-sm font-medium text-copper-600">{subtitle}</p>
        </div>

        <p className="mb-4 text-sm leading-7 text-gray-700">{reason}</p>

        <div className="mb-5 space-y-2">
          {bullets.map((bullet) => (
            <div key={bullet} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-copper-600" />
              <span>{bullet}</span>
            </div>
          ))}
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl bg-copper-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-copper-700">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function TrustedExpertsPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f6f9fc]">
      <main className="max-w-7xl mx-auto px-4 py-10">
        <section className="mb-8 rounded-3xl bg-[#17365d] p-8 text-white shadow-sm">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-copper-200">
            <Briefcase className="h-4 w-4" />
            Trusted Experts
          </div>

          <h1 className="max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
            Get the right help, without the pushy product sales.
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-white/90 md:text-lg">
            A Wealthy Foundation is built around trustworthy guidance. If your score shows
            that you may need help in a specific area, these are the kinds of professionals
            we want to recommend — vetted, aligned, and focused on helping you make smart
            long-term decisions.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/my-foundation')}
              className="rounded-xl bg-copper-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-copper-700"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/results')}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              View Full Report
            </button>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-copper-600" />
            <h2 className="text-2xl font-bold text-navy-900">Experts we plan to recommend</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <ExpertCard
              kind="planner"
              title="Fiduciary Financial Planner"
              subtitle="Best fit when Investing, Saving, or Direction need work"
              reason="A fiduciary planner can help you build a practical investing plan, set priorities, and make sure your money decisions actually support the life you want."
              bullets={[
                'Investment strategy and account planning',
                'Goal setting and long-term wealth planning',
                'Higher-trust option than product-driven sales',
              ]}
              cta="Find a planner"
            />

            <ExpertCard
              kind="cpa"
              title="CPA / Tax Strategist"
              subtitle="Best fit when income rises or tax complexity increases"
              reason="A good CPA can help you reduce surprises, improve tax efficiency, and make smarter decisions around income, deductions, retirement contributions, and business activity."
              bullets={[
                'Tax planning and filing support',
                'Self-employed or side-income guidance',
                'Retirement and contribution strategy',
              ]}
              cta="Find a CPA"
            />

            <ExpertCard
              kind="insurance"
              title="Insurance Advisor"
              subtitle="Best fit when Protection is weak"
              reason="If one setback could seriously damage your progress, an insurance review may be worth it. The goal is not to buy more than you need — it is to make sure you are not exposed where it matters most."
              bullets={[
                'Life, disability, home, auto, and umbrella review',
                'Family and income protection planning',
                'Coverage review without scare tactics',
              ]}
              cta="Review protection"
            />

            <ExpertCard
              kind="attorney"
              title="Will & Trust Attorney"
              subtitle="Best fit for family protection and legacy planning"
              reason="Estate planning is one of those things people put off too long. A strong will, trust, and beneficiary review can protect your family and make sure your wishes are carried out clearly."
              bullets={[
                'Wills, trusts, powers of attorney',
                'Beneficiary and probate planning',
                'Legacy and family protection',
              ]}
              cta="Find an attorney"
            />

            <ExpertCard
              kind="realtor"
              title="Trusted Realtor"
              subtitle="Best fit when housing is a major pressure point"
              reason="Housing decisions have a huge impact on your financial foundation. A trusted real estate professional can help you think more clearly about affordability, timing, and tradeoffs."
              bullets={[
                'Buying, selling, and housing fit',
                'Affordability and local-market guidance',
                'Smarter big-decision support',
              ]}
              cta="Find a realtor"
            />

            <ExpertCard
              kind="retirement"
              title="Retirement Specialist"
              subtitle="Best fit for later-stage retirement planning"
              reason="As retirement gets closer, the decisions become more specialized. This is where it makes sense to work with someone who understands income strategy, account sequencing, and protecting what you have built."
              bullets={[
                'Retirement income planning',
                'Social Security and withdrawal strategy',
                'Late-stage planning support',
              ]}
              cta="Talk to a specialist"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-[#d7e3f0] bg-white p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-2xl font-bold text-navy-900">How this should work on the site</h2>
              <p className="mb-4 leading-7 text-gray-700">
                The report and dashboard are the best places to surface expert help because
                they already know what the user needs. The recommendations should stay
                optional, relevant, and tied to actual weaknesses in the user’s foundation.
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-copper-600" />
                  <span>Show only 2–3 relevant expert categories at a time</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-copper-600" />
                  <span>Use plain language like “If you want help with this…”</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-copper-600" />
                  <span>Avoid credit cards, debt consolidation, or product-heavy offers</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#f8fbff] p-6">
              <h3 className="mb-3 text-lg font-bold text-navy-900">Strong first partner categories</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <Landmark className="h-4 w-4 text-copper-600" />
                  Fiduciary advisor networks
                </div>
                <div className="flex items-center gap-3">
                  <Calculator className="h-4 w-4 text-copper-600" />
                  CPA and tax-planning groups
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-copper-600" />
                  Insurance review partners
                </div>
                <div className="flex items-center gap-3">
                  <ScrollText className="h-4 w-4 text-copper-600" />
                  Estate planning providers
                </div>
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-copper-600" />
                  Realtor referral networks
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
