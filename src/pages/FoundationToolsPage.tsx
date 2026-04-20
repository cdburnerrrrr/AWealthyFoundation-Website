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
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-copper-500/10 blur-3xl transition-transform duration-500 group-hover:scale-125" />

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-copper-500/15 text-copper-300 shadow-lg shadow-copper-900/20">
            {icon}
          </div>
          {badge && (
            <span className="rounded-full border border-copper-400/25 bg-copper-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-copper-100">
              {badge}
            </span>
          )}
        </div>

        <h3 className="mb-2 text-xl font-semibold tracking-tight text-white">{title}</h3>
        <p className="mb-4 text-sm leading-6 text-white/72">{description}</p>

        <div className="mb-5 rounded-2xl border border-white/10 bg-navy-950/35 px-4 py-3 text-sm text-white/80">
          <span className="font-semibold text-copper-100">Best for:</span> {bestFor}
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-semibold text-copper-200 transition-transform duration-300 group-hover:translate-x-1">
          <span>{disabled ? 'Coming Soon' : 'Open Tool'}</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </>
  );

  const baseClassName =
    'group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300';

  if (disabled) {
    return (
      <div
        className={`${baseClassName} cursor-default opacity-90 hover:border-white/15 hover:bg-white/[0.07]`}
        aria-disabled="true"
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`${baseClassName} hover:-translate-y-1 hover:border-copper-400/30 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-copper-900/20`}
    >
      {cardContent}
    </Link>
  );
}

function CategoryHeader({ icon, title, description }: CategoryHeaderProps) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-copper-300">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">{description}</p>
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
          ? 'text-white'
          : 'text-white/72 hover:text-white'
      }`}
    >
      <span
        className={`absolute inset-0 rounded-full border transition-all duration-300 ${
          isActive
            ? 'border-copper-300/40 bg-white/[0.08] shadow-[0_0_24px_rgba(222,161,93,0.18)]'
            : 'border-white/10 bg-white/[0.04] group-hover:border-white/20 group-hover:bg-white/[0.07]'
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
    accent: 'from-copper-300/30 via-sky-200/20 to-copper-300/20',
    glow: 'bg-copper-400/12',
    drafting: 'border-sky-100/70',
    heroGlow: 'bg-copper-500/12',
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
    accent: 'from-rose-300/20 via-copper-300/18 to-sky-200/12',
    glow: 'bg-rose-300/10',
    drafting: 'border-rose-100/60',
    heroGlow: 'bg-rose-300/10',
    tools: [
      {
        to: '#',
        title: 'Debt Pressure Check',
        description:
          'Measure how much your required debt payments are squeezing your monthly flexibility and identify when the load is getting too heavy.',
        bestFor: 'understanding whether debt is slowing everything else down',
        icon: <Shield size={22} />,
        badge: 'Coming Soon',
        disabled: true,
      },
      {
        to: '#',
        title: 'Debt Payoff Planner',
        description:
          'Compare payoff approaches, test extra payments, and see how much faster you could get free of the weight.',
        bestFor: 'building a clearer payoff plan with momentum',
        icon: <Landmark size={22} />,
        badge: 'Coming Soon',
        disabled: true,
      },
    ],
  },
  saving: {
    icon: <PiggyBank size={24} />,
    title: 'Saving Tools',
    description:
      'Build cushion, strengthen resilience, and see how much cash reserve would give you more peace of mind.',
    accent: 'from-emerald-300/20 via-sky-200/20 to-copper-300/12',
    glow: 'bg-emerald-300/10',
    drafting: 'border-emerald-100/60',
    heroGlow: 'bg-emerald-300/10',
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
    accent: 'from-sky-300/22 via-copper-300/16 to-indigo-200/10',
    glow: 'bg-sky-300/10',
    drafting: 'border-sky-100/60',
    heroGlow: 'bg-sky-300/10',
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
    <div className="relative min-h-screen overflow-hidden bg-[#081a2d] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#143a5c_0%,#0a2138_42%,#081a2d_100%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#cfe8ff1f_1px,transparent_1px),linear-gradient(to_bottom,#cfe8ff1f_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:160px_160px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,rgba(207,232,255,0.42)_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.11] transition-all duration-500">
        <div className={`absolute left-[8%] top-20 h-52 w-52 rounded-full border ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute left-[13%] top-28 h-40 w-72 rotate-[-10deg] border-t ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute right-[10%] top-24 h-64 w-64 rounded-full border ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute right-[12%] top-44 h-0 w-56 border-t ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute left-[6%] bottom-24 h-44 w-44 rotate-12 border ${activeCategory.drafting} transition-all duration-500`} />
        <div className={`absolute right-[8%] bottom-20 h-32 w-80 rotate-[-8deg] border-t ${activeCategory.drafting} transition-all duration-500`} />
      </div>

      <div className={`pointer-events-none absolute left-[-120px] top-[-80px] h-80 w-80 rounded-full blur-3xl transition-all duration-500 ${activeCategory.heroGlow}`} />
      <div className={`pointer-events-none absolute bottom-[-120px] right-[-80px] h-96 w-96 rounded-full blur-3xl transition-all duration-500 ${activeCategory.glow}`} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="relative mb-10 overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] px-6 py-8 backdrop-blur-sm sm:px-10 sm:py-9">
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:26px_26px]" />
          </div>

          <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-r ${activeCategory.accent} blur-2xl transition-all duration-500`} />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-copper-200/80">
                Foundation Tools
              </p>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
                Choose the right tool for the part of your foundation you want to strengthen.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                Start with the category that matters most right now. Open a tool when you are ready,
                get a quick answer, and come back for the next step.
              </p>
            </div>

            <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
              <div className="relative h-[220px] w-full sm:h-[240px]">
                <div className="absolute left-1/2 top-0 h-8 w-36 -translate-x-1/2 rounded-t-full border border-copper-300/30 bg-copper-400/20" />
                <div className="absolute left-1/2 top-8 h-20 w-48 -translate-x-1/2 rounded-t-[28px] border border-copper-200/30 bg-copper-300/10" />
                <div className="absolute left-1/2 top-28 h-24 w-60 -translate-x-1/2 rounded-t-xl border border-sky-100/20 bg-sky-200/10" />
                <div className="absolute bottom-10 left-1/2 h-10 w-72 -translate-x-1/2 rounded-md bg-gradient-to-r from-copper-400/70 via-sky-300/50 to-copper-400/70" />
                <div className="absolute bottom-0 left-1/2 h-9 w-[20rem] -translate-x-1/2 rounded-md border border-white/10 bg-white/5" />

                <div className="absolute left-6 top-10 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 shadow-xl backdrop-blur-sm">
                  Spending
                </div>
                <div className="absolute right-6 top-16 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 shadow-xl backdrop-blur-sm">
                  Debt
                </div>
                <div className="absolute left-8 bottom-9 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 shadow-xl backdrop-blur-sm">
                  Saving
                </div>
                <div className="absolute right-8 bottom-14 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 shadow-xl backdrop-blur-sm">
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

        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff18_1px,transparent_1px),linear-gradient(to_bottom,#ffffff18_1px,transparent_1px)] bg-[size:24px_24px]" />
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
