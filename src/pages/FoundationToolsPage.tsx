import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CreditCard,
  Home,
  PiggyBank,
  TrendingUp,
  Wallet,
  Shield,
  Landmark,
} from 'lucide-react';

type TabKey = 'spending' | 'debt' | 'saving' | 'investing';

type ToolCardProps = {
  to: string;
  title: string;
  description: string;
  bestFor: string;
  icon: React.ReactNode;
  badge?: string;
  disabled?: boolean;
};

type CategoryHeaderProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

type TabButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function ToolCard({
  to,
  title,
  description,
  bestFor,
  icon,
  badge,
  disabled = false,
}: ToolCardProps) {
  const cardContent = (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-copper-400/12 blur-3xl transition-transform duration-500 group-hover:scale-125" />

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-copper-200/60 text-copper-700 shadow-lg shadow-copper-300/30">
            {icon}
          </div>
          {badge && (
            <span className="rounded-full border border-copper-400/25 bg-copper-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-copper-700">
              {badge}
            </span>
          )}
        </div>

        <h3 className="mb-2 text-xl font-semibold tracking-tight text-navy-900">{title}</h3>
        <p className="mb-4 text-sm leading-6 text-navy-700">{description}</p>

        <div className="mb-5 rounded-2xl border border-navy-200 bg-[#edf6fb] px-4 py-3 text-sm text-navy-800">
          <span className="font-semibold text-copper-700">Best for:</span> {bestFor}
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-semibold text-copper-700 transition-transform duration-300 group-hover:translate-x-1">
          <span>{disabled ? 'Coming Soon' : 'Open Tool'}</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </>
  );

  const baseClassName =
    'group relative overflow-hidden rounded-[28px] border border-navy-300/70 bg-white/72 p-6 backdrop-blur-sm transition-all duration-300';

  if (disabled) {
    return (
      <div
        className={`${baseClassName} cursor-default opacity-95 hover:border-navy-300 hover:bg-white/80`}
        aria-disabled="true"
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`${baseClassName} hover:-translate-y-1 hover:-translate-y-1 hover:border-copper-400/45 hover:bg-white/90 hover:shadow-2xl hover:shadow-copper-300/20`}
    >
      {cardContent}
    </Link>
  );
}

function CategoryHeader({ icon, title, description }: CategoryHeaderProps) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-navy-200 bg-white/70 text-copper-700">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-navy-900">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-700">{description}</p>
      </div>
    </div>
  );
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 sm:px-5 ${
        isActive
          ? 'text-navy-900'
          : 'text-navy-700 hover:text-navy-900'
      }`}
    >
      <span
        className={`absolute inset-0 rounded-full border transition-all duration-300 ${
          isActive
            ? 'border-copper-300/70 bg-white/90 shadow-[0_0_24px_rgba(222,161,93,0.14)]'
            : 'border-navy-200 bg-white/60 group-hover:border-navy-300 group-hover:bg-white/85'
        }`}
      />
      <span className="relative z-10">{label}</span>
      <span
        className={`absolute bottom-[3px] left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-copper-300 shadow-[0_0_12px_rgba(255,207,136,0.65)] transition-all duration-300 ${
          isActive ? 'w-[62%] opacity-100' : 'w-0 opacity-0'
        }`}
      />
    </button>
  );
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'spending', label: 'Spending' },
  { key: 'debt', label: 'Debt' },
  { key: 'saving', label: 'Saving' },
  { key: 'investing', label: 'Investing' },
];

const categoryMeta: Record<
  TabKey,
  {
    icon: React.ReactNode;
    title: string;
    description: string;
    accent: string;
    glow: string;
    drafting: string;
    heroGlow: string;
    tools: ToolCardProps[];
  }
> = {
  spending: {
    icon: <Wallet size={24} />,
    title: 'Spending Tools',
    description:
      'See how much of your income is already spoken for, how much room you really have left, and where your monthly plan may be getting too tight.',
    accent: 'from-copper-300/18 via-sky-300/14 to-copper-300/14',
    glow: 'bg-copper-400/14',
    drafting: 'border-navy-700/45',
    heroGlow: 'bg-copper-400/18',
    tools: [
      {
        to: '/foundation-tools/fixed-cost-load',
        title: 'Fixed Cost Load',
        description:
          'See how much of your take-home pay is already committed before life even starts happening. A fast way to spot pressure.',
        bestFor: 'quickly spotting budget pressure and breathing room',
        icon: <Home size={22} />,
        badge: 'Quick Check',
      },
      {
        to: '/foundation-tools/monthly-margin-planner',
        title: 'Monthly Margin Planner',
        description:
          'Map where your money is going and see whether your current plan is creating progress or slowly boxing you in.',
        bestFor: 'planning monthly cash flow before it disappears',
        icon: <Wallet size={22} />,
        badge: 'Planner',
      },
    ],
  },
  debt: {
    icon: <CreditCard size={24} />,
    title: 'Debt Tools',
    description:
      'Measure the weight your debt is putting on your foundation and find the fastest path to a cleaner monthly picture.',
    accent: 'from-rose-300/12 via-copper-300/12 to-sky-300/10',
    glow: 'bg-rose-300/12',
    drafting: 'border-navy-700/42',
    heroGlow: 'bg-rose-300/14',
    tools: [
      {
        to: '/foundation-tools/debt-pressure-check',
        title: 'Debt Pressure Check',
        description:
          'Measure how much your required debt payments are squeezing your monthly flexibility and identify when the load is getting too heavy.',
        bestFor: 'understanding whether debt is slowing everything else down',
        icon: <Shield size={22} />,
        badge: 'Live',
      },
      {
        to: '/foundation-tools/my-freedom-date',
        title: 'My Freedom Date',
        description:
          'Enter your debts, adjust your monthly plan, and see when you could be debt-free.',
        bestFor: 'turning debt payoff into a real timeline',
        icon: <Landmark size={22} />,
        badge: 'Live',
      },
    ],
  },
  saving: {
    icon: <PiggyBank size={24} />,
    title: 'Saving Tools',
    description:
      'Build cushion, strengthen resilience, and see how much cash reserve would give you more peace of mind.',
    accent: 'from-emerald-300/12 via-sky-300/12 to-copper-300/10',
    glow: 'bg-emerald-300/12',
    drafting: 'border-navy-700/42',
    heroGlow: 'bg-emerald-300/14',
    tools: [
      {
        to: '#',
        title: 'Emergency Fund Target',
        description:
          'Estimate the cushion that would help protect you from job interruptions, surprises, and the next expensive month.',
        bestFor: 'figuring out how much savings would actually feel safe',
        icon: <PiggyBank size={22} />,
        badge: 'Coming Soon',
        disabled: true,
      },
      {
        to: '#',
        title: 'Savings Runway',
        description:
          'See how many months of essential expenses your current savings could cover if life suddenly changed.',
        bestFor: 'understanding how long your cash buffer really lasts',
        icon: <Shield size={22} />,
        badge: 'Coming Soon',
        disabled: true,
      },
    ],
  },
  investing: {
    icon: <TrendingUp size={24} />,
    title: 'Investing Tools',
    description:
      'See what time, consistency, and better planning can do for your future without turning the experience into a sterile calculator.',
    accent: 'from-sky-300/14 via-copper-300/12 to-indigo-300/10',
    glow: 'bg-sky-300/12',
    drafting: 'border-navy-700/42',
    heroGlow: 'bg-sky-300/14',
    tools: [
      {
        to: '#',
        title: 'Compound Growth Builder',
        description:
          'See how small steady investing can build real momentum over time and where more time makes the biggest difference.',
        bestFor: 'visualizing growth from steady contributions',
        icon: <TrendingUp size={22} />,
        badge: 'Coming Soon',
        disabled: true,
      },
      {
        to: '#',
        title: 'Future Value Goal Planner',
        description:
          'Start with the future amount you want and work backward to estimate the monthly contribution needed to get there.',
        bestFor: 'turning a long-term goal into a monthly target',
        icon: <Wallet size={22} />,
        badge: 'Coming Soon',
        disabled: true,
      },
    ],
  },
};

export default function FoundationToolsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('spending');

  const activeCategory = useMemo(() => categoryMeta[activeTab], [activeTab]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#d8ecf8] text-navy-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#eef8ff_0%,#d8ecf8_46%,#c6e2f2_100%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.28]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a2f_1px,transparent_1px),linear-gradient(to_bottom,#0f3a5a2f_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.16]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a1f_1px,transparent_1px),linear-gradient(to_bottom,#0f3a5a1f_1px,transparent_1px)] bg-[size:160px_160px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,58,90,0.34)_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.11] transition-all duration-500">
        <div className={`absolute left-[8%] top-20 h-52 w-52 rounded-full border ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute left-[13%] top-28 h-40 w-72 rotate-[-10deg] border-t ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute right-[10%] top-24 h-64 w-64 rounded-full border ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute right-[12%] top-44 h-0 w-56 border-t ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute left-[6%] bottom-24 h-44 w-44 rotate-12 border ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute right-[8%] bottom-20 h-32 w-80 rotate-[-8deg] border-t ${activeCategory.drafting} transition-all duration-500`} />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.28] transition-all duration-500">
        <div className={`absolute left-[18%] top-[10.5rem] h-0 w-44 border-t border-dashed ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute left-[18%] top-[10.2rem] h-3 w-0 border-l ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute left-[29%] top-[10.2rem] h-3 w-0 border-l ${activeCategory.drafting} transition-all duration-500`} />

        <div className={`absolute right-[16%] top-[18rem] h-0 w-36 border-t border-dashed ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute right-[16%] top-[17.7rem] h-3 w-0 border-l ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute right-[7%] top-[17.7rem] h-3 w-0 border-l ${activeCategory.drafting} transition-all duration-500`} />

        <div className={`absolute left-[11%] bottom-[22%] h-20 w-20 rounded-bl-full border-b border-l ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute right-[21%] top-[15%] h-24 w-24 rounded-tr-full border-t border-r ${activeCategory.drafting} transition-all duration-500`} />

        <div className={`absolute left-[22%] bottom-[18%] h-10 w-10 transition-all duration-500`}>
          <div className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 ${activeCategory.glow}`} />
          <div className={`absolute top-1/2 left-0 h-px w-full -translate-y-1/2 ${activeCategory.glow}`} />
          <div className={`absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${activeCategory.glow}`} />
        </div>

        <div className={`absolute right-[14%] bottom-[26%] h-12 w-12 transition-all duration-500`}>
          <div className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 ${activeCategory.glow}`} />
          <div className={`absolute top-1/2 left-0 h-px w-full -translate-y-1/2 ${activeCategory.glow}`} />
          <div className={`absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${activeCategory.glow}`} />
        </div>

        <div className={`absolute left-[7%] top-[34%] h-0 w-20 border-t ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute left-[7%] top-[34%] h-2 w-0 border-l ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute left-[12%] top-[34%] h-2 w-0 border-l ${activeCategory.drafting} transition-all duration-500`} />

        <div className={`absolute right-[9%] bottom-[16%] h-0 w-24 border-t ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute right-[9%] bottom-[16%] h-2 w-0 border-l ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute right-[15%] bottom-[16%] h-2 w-0 border-l ${activeCategory.drafting} transition-all duration-500`} />
      </div>

      <div className={`pointer-events-none absolute left-[-120px] top-[-80px] h-80 w-80 rounded-full blur-3xl transition-all duration-500 ${activeCategory.heroGlow}`} />
      <div className={`pointer-events-none absolute bottom-[-120px] right-[-80px] h-96 w-96 rounded-full blur-3xl transition-all duration-500 ${activeCategory.glow}`} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="relative mb-10 overflow-hidden rounded-[36px] border border-navy-200/80 bg-white/65 px-6 py-8 backdrop-blur-sm sm:px-10 sm:py-9">
          <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a24_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:26px_26px]" />
          </div>

          <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-r ${activeCategory.accent} blur-2xl transition-all duration-500`} />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-copper-700/90">
                Foundation Tools
              </p>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl lg:text-[2.65rem]">
                Choose the right tool for the part of your foundation you want to strengthen.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-navy-700 sm:text-base">
                Start with the category that matters most right now. Open a tool when you are ready,
                get a quick answer, and come back for the next step.
              </p>
            </div>

            <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
              <div className="relative h-[220px] w-full sm:h-[240px]">
                <div className="absolute left-1/2 top-0 h-8 w-36 -translate-x-1/2 rounded-t-full border border-copper-500/45 bg-copper-200/45" />
                <div className="absolute left-1/2 top-8 h-20 w-48 -translate-x-1/2 rounded-t-[28px] border border-copper-500/35 bg-copper-100/60" />
                <div className="absolute left-1/2 top-28 h-24 w-60 -translate-x-1/2 rounded-t-xl border border-navy-300/40 bg-sky-100/55" />
                <div className="absolute bottom-10 left-1/2 h-10 w-72 -translate-x-1/2 rounded-md bg-gradient-to-r from-copper-300/70 via-sky-200/65 to-copper-300/70" />
                <div className="absolute bottom-0 left-1/2 h-9 w-[20rem] -translate-x-1/2 rounded-md border border-navy-200 bg-white/75" />

                <div className="absolute left-6 top-10 rounded-2xl border border-navy-200 bg-white/75 px-4 py-2.5 text-sm text-navy-800 shadow-xl backdrop-blur-sm">
                  Spending
                </div>
                <div className="absolute right-6 top-16 rounded-2xl border border-navy-200 bg-white/75 px-4 py-2.5 text-sm text-navy-800 shadow-xl backdrop-blur-sm">
                  Debt
                </div>
                <div className="absolute left-8 bottom-9 rounded-2xl border border-navy-200 bg-white/75 px-4 py-2.5 text-sm text-navy-800 shadow-xl backdrop-blur-sm">
                  Saving
                </div>
                <div className="absolute right-8 bottom-14 rounded-2xl border border-navy-200 bg-white/75 px-4 py-2.5 text-sm text-navy-800 shadow-xl backdrop-blur-sm">
                  Investing
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {TABS.map((tab) => (
              <TabButton
                key={tab.key}
                label={tab.label}
                isActive={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              />
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[32px] border border-navy-200/80 bg-white/68 p-6 backdrop-blur-sm sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff18_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>

          <div className={`pointer-events-none absolute inset-x-10 top-0 h-24 rounded-full bg-gradient-to-r ${activeCategory.accent} blur-3xl transition-all duration-500`} />

          <div
            key={activeTab}
            className="relative z-10 animate-[slideFadeIn_420ms_ease-out]"
          >
            <CategoryHeader
              icon={activeCategory.icon}
              title={activeCategory.title}
              description={activeCategory.description}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              {activeCategory.tools.map((tool) => (
                <ToolCard key={tool.title} {...tool} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes slideFadeIn {
          0% {
            opacity: 0;
            transform: translateX(22px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
