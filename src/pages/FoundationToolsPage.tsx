import { Link } from 'react-router-dom';
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

type ToolCardProps = {
  to: string;
  title: string;
  description: string;
  bestFor: string;
  icon: React.ReactNode;
  badge?: string;
};

function ToolCard({ to, title, description, bestFor, icon, badge }: ToolCardProps) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-copper-400/30 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-copper-900/20"
    >
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
          <span>Open Tool</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}

function CategoryHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
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

export default function FoundationToolsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#081a2d] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#143a5c_0%,#0a2138_42%,#081a2d_100%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#cfe8ff1f_1px,transparent_1px),linear-gradient(to_bottom,#cfe8ff1f_1px,transparent_1px)] bg-[size:36px_36px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:180px_180px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,rgba(207,232,255,0.42)_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.1]">
        <div className="absolute left-[8%] top-24 h-56 w-56 rounded-full border border-sky-200/70" />
        <div className="absolute left-[14%] top-32 h-40 w-72 rotate-[-10deg] border-t border-sky-100/70" />
        <div className="absolute right-[10%] top-28 h-64 w-64 rounded-full border border-sky-100/60" />
        <div className="absolute right-[12%] top-48 h-0 w-56 border-t border-sky-100/70" />
        <div className="absolute left-[6%] bottom-28 h-44 w-44 rotate-12 border border-sky-100/60" />
        <div className="absolute right-[8%] bottom-24 h-32 w-80 rotate-[-8deg] border-t border-sky-100/60" />
      </div>

      <div className="pointer-events-none absolute left-[-120px] top-[-80px] h-80 w-80 rounded-full bg-copper-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-96 w-96 rounded-full bg-sky-300/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <section className="mb-16 overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] px-6 py-10 backdrop-blur-sm sm:px-10">
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:28px_28px]" />
          </div>

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-copper-200/80">
                Foundation Tools
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Choose the right tool for the part of your foundation you want to strengthen.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/72">
                Instead of one long page of calculators, start with the category that matters most right now.
                Open a tool when you are ready, get a quick answer, and come back for the next step.
              </p>
            </div>

            <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
              <div className="relative h-[260px] w-full">
                <div className="absolute left-1/2 top-0 h-8 w-36 -translate-x-1/2 rounded-t-full border border-copper-300/30 bg-copper-400/20" />
                <div className="absolute left-1/2 top-8 h-24 w-52 -translate-x-1/2 rounded-t-[28px] border border-copper-200/30 bg-copper-300/10" />
                <div className="absolute left-1/2 top-32 h-28 w-64 -translate-x-1/2 rounded-t-xl border border-sky-100/20 bg-sky-200/10" />
                <div className="absolute bottom-12 left-1/2 h-12 w-80 -translate-x-1/2 rounded-md bg-gradient-to-r from-copper-400/70 via-sky-300/50 to-copper-400/70" />
                <div className="absolute bottom-0 left-1/2 h-10 w-[22rem] -translate-x-1/2 rounded-md border border-white/10 bg-white/5" />

                <div className="absolute left-8 top-10 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 shadow-xl backdrop-blur-sm">
                  Spending
                </div>
                <div className="absolute right-8 top-16 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 shadow-xl backdrop-blur-sm">
                  Debt
                </div>
                <div className="absolute left-10 bottom-10 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 shadow-xl backdrop-blur-sm">
                  Saving
                </div>
                <div className="absolute right-10 bottom-16 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 shadow-xl backdrop-blur-sm">
                  Investing
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <CategoryHeader
            icon={<Wallet size={24} />}
            title="Spending Tools"
            description="See how much of your income is already spoken for, how much room you really have left, and where your monthly plan may be getting too tight."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <ToolCard
              to="/foundation-tools/fixed-cost-load"
              title="Fixed Cost Load"
              description="See how much of your take-home pay is already committed before life even starts happening. A fast way to spot pressure."
              bestFor="quickly spotting budget pressure and breathing room"
              icon={<Home size={22} />}
              badge="Quick Check"
            />
            <ToolCard
              to="/foundation-tools/monthly-margin-planner"
              title="Monthly Margin Planner"
              description="Map where your money is going and see whether your current plan is creating progress or slowly boxing you in."
              bestFor="planning monthly cash flow before it disappears"
              icon={<Wallet size={22} />}
              badge="Planner"
            />
          </div>
        </section>

        <section className="mb-16">
          <CategoryHeader
            icon={<CreditCard size={24} />}
            title="Debt Tools"
            description="Measure the weight your debt is putting on your foundation and find the fastest path to a cleaner monthly picture."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <ToolCard
              to="/foundation-tools/debt-pressure-check"
              title="Debt Pressure Check"
              description="Measure how much your required debt payments are squeezing your monthly flexibility and identify when the load is getting too heavy."
              bestFor="understanding whether debt is slowing everything else down"
              icon={<Shield size={22} />}
              badge="Coming Soon"
            />
            <ToolCard
              to="/foundation-tools/debt-payoff-planner"
              title="Debt Payoff Planner"
              description="Compare payoff approaches, test extra payments, and see how much faster you could get free of the weight."
              bestFor="building a clearer payoff plan with momentum"
              icon={<Landmark size={22} />}
              badge="Coming Soon"
            />
          </div>
        </section>

        <section className="mb-16">
          <CategoryHeader
            icon={<PiggyBank size={24} />}
            title="Saving Tools"
            description="Build cushion, strengthen resilience, and see how much cash reserve would give you more peace of mind."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <ToolCard
              to="/foundation-tools/emergency-fund-target"
              title="Emergency Fund Target"
              description="Estimate the cushion that would help protect you from job interruptions, surprises, and the next expensive month."
              bestFor="figuring out how much savings would actually feel safe"
              icon={<PiggyBank size={22} />}
              badge="Coming Soon"
            />
            <ToolCard
              to="/foundation-tools/savings-runway"
              title="Savings Runway"
              description="See how many months of essential expenses your current savings could cover if life suddenly changed."
              bestFor="understanding how long your cash buffer really lasts"
              icon={<Shield size={22} />}
              badge="Coming Soon"
            />
          </div>
        </section>

        <section>
          <CategoryHeader
            icon={<TrendingUp size={24} />}
            title="Investing Tools"
            description="See what time, consistency, and better planning can do for your future without turning the experience into a sterile calculator."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <ToolCard
              to="/foundation-tools/compound-growth-builder"
              title="Compound Growth Builder"
              description="See how small steady investing can build real momentum over time and where more time makes the biggest difference."
              bestFor="visualizing growth from steady contributions"
              icon={<TrendingUp size={22} />}
              badge="Coming Soon"
            />
            <ToolCard
              to="/foundation-tools/future-value-goal-planner"
              title="Future Value Goal Planner"
              description="Start with the future amount you want and work backward to estimate the monthly contribution needed to get there."
              bestFor="turning a long-term goal into a monthly target"
              icon={<Wallet size={22} />}
              badge="Coming Soon"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
