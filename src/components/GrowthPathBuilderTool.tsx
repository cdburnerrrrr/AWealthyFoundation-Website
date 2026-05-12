import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  ChevronDown,
  Flag,
  LineChart,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  calculateGoalPlan,
  calculateGrowthProjection,
  formatGrowthCurrency,
  getReadableYearLabel,
  type GrowthYearSnapshot,
} from '../lib/growthPathEngine';

type Mode = 'project' | 'goal';

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  helper?: string;
};

type ResultCardProps = {
  label: string;
  value: string;
  helper?: string;
  highlight?: boolean;
};

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function NumberField({ label, value, onChange, prefix, suffix, helper }: NumberFieldProps) {
  return (
    <label className="block rounded-2xl bg-white/78 p-3.5 ring-1 ring-[#2b5676]/12 transition focus-within:ring-[#b8742a]/24">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[#6f8aa3]">
        {label}
      </span>
      <div className="flex items-center rounded-xl border border-[#2b5676]/12 bg-white/92 px-3 py-2.5 text-sm text-[#153b58]">
        {prefix && <span className="mr-1 text-[#7c95ab]">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(toNumber(event.target.value))}
          className="w-full bg-transparent text-base font-semibold text-[#0f2a44] outline-none"
        />
        {suffix && <span className="ml-1 text-[#7c95ab]">{suffix}</span>}
      </div>
      {helper && <span className="mt-1.5 block text-xs leading-5 text-[#6f8aa3]">{helper}</span>}
    </label>
  );
}

function ResultCard({ label, value, helper, highlight = false }: ResultCardProps) {
  return (
    <div
      className={`rounded-2xl p-4 ring-1 ${
        highlight
          ? 'bg-[#b8742a]/10 ring-[#b8742a]/16'
          : 'bg-white/78 ring-[#2b5676]/12'
      }`}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-[0.13em] ${highlight ? 'text-[#8a5a24]' : 'text-[#6f8aa3]'}`}>
        {label}
      </p>
      <p className={`mt-1.5 text-2xl font-semibold ${highlight ? 'text-[#6d4318]' : 'text-[#0f2a44]'}`}>
        {value}
      </p>
      {helper && <p className="mt-2 text-sm leading-5 text-[#6f8aa3]">{helper}</p>}
    </div>
  );
}

function getDisplayYears(timeline: GrowthYearSnapshot[]) {
  if (timeline.length <= 8) return timeline;

  const finalYear = timeline[timeline.length - 1]?.year ?? timeline.length;
  const step = finalYear <= 15 ? 2 : finalYear <= 30 ? 5 : 10;

  const selected = timeline.filter((item) => item.year === 1 || item.year % step === 0 || item.year === finalYear);
  return selected.length > 0 ? selected : timeline.slice(-8);
}

function GrowthTimeline({ timeline, title }: { timeline: GrowthYearSnapshot[]; title: string }) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? timeline : getDisplayYears(timeline);
  const maxBalance = Math.max(...timeline.map((item) => item.balance), 1);

  return (
    <section className="rounded-2xl bg-white/80 ring-1 ring-[#2b5676]/12">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
      >
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">{title}</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">
            {expanded ? 'Showing every modeled year.' : 'Showing key years from the path.'}
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/86 text-[#5a7690] ring-1 ring-[#2b5676]/10">
          <ChevronDown size={18} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <div className="border-t border-[#2b5676]/10 px-4 pb-4 pt-3">
        <div className="space-y-2.5">
          {rows.map((item) => {
            const width = `${Math.max(4, Math.min(100, (item.balance / maxBalance) * 100))}%`;
            return (
              <div key={item.year} className="grid gap-2 sm:grid-cols-[70px_1fr_145px] sm:items-center">
                <div className="text-sm font-semibold text-[#153b58]">Year {item.year}</div>
                <div className="h-3 overflow-hidden rounded-full bg-[#c6ddeb]/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#77a9bf] to-[#b8742a] transition-all duration-300"
                    style={{ width }}
                  />
                </div>
                <div className="text-sm font-semibold text-[#0f2a44] sm:text-right">
                  {formatGrowthCurrency(item.balance)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function GrowthPathBuilderTool() {
  const [mode, setMode] = useState<Mode>('project');

  const [projectInputs, setProjectInputs] = useState({
    startingBalance: 10000,
    monthlyContribution: 500,
    years: 20,
    annualReturn: 7,
    annualContributionIncrease: 0,
  });

  const [goalInputs, setGoalInputs] = useState({
    goalAmount: 250000,
    currentBalance: 10000,
    currentMonthlyContribution: 300,
    years: 20,
    annualReturn: 7,
  });

  const projection = useMemo(() => calculateGrowthProjection(projectInputs), [projectInputs]);
  const goalPlan = useMemo(() => calculateGoalPlan(goalInputs), [goalInputs]);

  const updateProject = (key: keyof typeof projectInputs, value: number) => {
    setProjectInputs((previous) => ({ ...previous, [key]: value }));
  };

  const updateGoal = (key: keyof typeof goalInputs, value: number) => {
    setGoalInputs((previous) => ({ ...previous, [key]: value }));
  };

  const activeTimeline = mode === 'project' ? projection.timeline : goalPlan.timeline;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] border border-[#2b5676]/12 bg-white/72 p-4 shadow-sm sm:p-5">
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff26_1px,transparent_1px)] bg-[size:22px_22px]" />
        </div>

        <div className="relative z-10 grid gap-3 lg:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode('project')}
            className={`rounded-2xl p-4 text-left transition ${
              mode === 'project'
                ? 'bg-[#0f3a5a] text-white shadow-lg shadow-[#0f3a5a]/18'
                : 'bg-white/80 text-[#0f2a44] ring-1 ring-[#2b5676]/12 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${mode === 'project' ? 'bg-white/12' : 'bg-[#b8742a]/10 text-[#8a5a24]'}`}>
                <TrendingUp size={20} />
              </span>
              <div>
                <p className="font-semibold">Project My Growth</p>
                <p className={`mt-1 text-sm ${mode === 'project' ? 'text-white/72' : 'text-[#6f8aa3]'}`}>
                  Start with what you have and see where the path could lead.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('goal')}
            className={`rounded-2xl p-4 text-left transition ${
              mode === 'goal'
                ? 'bg-[#0f3a5a] text-white shadow-lg shadow-[#0f3a5a]/18'
                : 'bg-white/80 text-[#0f2a44] ring-1 ring-[#2b5676]/12 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${mode === 'goal' ? 'bg-white/12' : 'bg-[#b8742a]/10 text-[#8a5a24]'}`}>
                <Target size={20} />
              </span>
              <div>
                <p className="font-semibold">Plan for a Goal</p>
                <p className={`mt-1 text-sm ${mode === 'goal' ? 'text-white/72' : 'text-[#6f8aa3]'}`}>
                  Start with a future target and work backward to a monthly amount.
                </p>
              </div>
            </div>
          </button>
        </div>
      </section>

      {mode === 'project' ? (
        <section className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-[#0f2a44]">1. Build your growth path</h3>
            <p className="mt-1 text-sm text-[#6f8aa3]">
              Use conservative assumptions and adjust one input at a time to see what moves the result.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <NumberField
              label="Starting balance"
              value={projectInputs.startingBalance}
              onChange={(value) => updateProject('startingBalance', value)}
              prefix="$"
            />
            <NumberField
              label="Monthly contribution"
              value={projectInputs.monthlyContribution}
              onChange={(value) => updateProject('monthlyContribution', value)}
              prefix="$"
            />
            <NumberField
              label="Years to invest"
              value={projectInputs.years}
              onChange={(value) => updateProject('years', value)}
              suffix="yrs"
            />
            <NumberField
              label="Estimated return"
              value={projectInputs.annualReturn}
              onChange={(value) => updateProject('annualReturn', value)}
              suffix="%"
              helper="Educational estimate, not a guarantee."
            />
            <NumberField
              label="Annual increase"
              value={projectInputs.annualContributionIncrease}
              onChange={(value) => updateProject('annualContributionIncrease', value)}
              suffix="%"
              helper="Optional contribution step-up."
            />
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-[#0f2a44]">1. Work backward from the goal</h3>
            <p className="mt-1 text-sm text-[#6f8aa3]">
              This turns a future number into a monthly investing target.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <NumberField
              label="Goal amount"
              value={goalInputs.goalAmount}
              onChange={(value) => updateGoal('goalAmount', value)}
              prefix="$"
            />
            <NumberField
              label="Current balance"
              value={goalInputs.currentBalance}
              onChange={(value) => updateGoal('currentBalance', value)}
              prefix="$"
            />
            <NumberField
              label="Current monthly"
              value={goalInputs.currentMonthlyContribution}
              onChange={(value) => updateGoal('currentMonthlyContribution', value)}
              prefix="$"
            />
            <NumberField
              label="Years until goal"
              value={goalInputs.years}
              onChange={(value) => updateGoal('years', value)}
              suffix="yrs"
            />
            <NumberField
              label="Estimated return"
              value={goalInputs.annualReturn}
              onChange={(value) => updateGoal('annualReturn', value)}
              suffix="%"
              helper="Educational estimate, not a guarantee."
            />
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">2. Your growth path</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">
            Investing works best when time, consistency, and contribution size are working together.
          </p>
        </div>

        {mode === 'project' ? (
          <div className="grid gap-3 lg:grid-cols-4">
            <ResultCard
              label="Projected value"
              value={formatGrowthCurrency(projection.futureValue)}
              helper={`After ${getReadableYearLabel(projectInputs.years)}.`}
              highlight
            />
            <ResultCard
              label="Total added"
              value={formatGrowthCurrency(projection.totalNewContributions)}
              helper="New monthly contributions."
            />
            <ResultCard
              label="Starting + added"
              value={formatGrowthCurrency(projection.totalContributed)}
              helper="Money you put in."
            />
            <ResultCard
              label="Estimated growth"
              value={formatGrowthCurrency(projection.estimatedGrowth)}
              helper="Potential growth from compounding."
            />
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-4">
            <ResultCard
              label="Needed monthly"
              value={formatGrowthCurrency(goalPlan.requiredMonthlyContribution)}
              helper={`To target ${formatGrowthCurrency(goalInputs.goalAmount)} in ${getReadableYearLabel(goalInputs.years)}.`}
              highlight
            />
            <ResultCard
              label="Monthly gap"
              value={formatGrowthCurrency(goalPlan.monthlyGap)}
              helper="Additional amount above today’s monthly contribution."
            />
            <ResultCard
              label="Current path"
              value={formatGrowthCurrency(goalPlan.currentPlanFutureValue)}
              helper={`${Math.round(goalPlan.projectedPercentOfGoal)}% of this goal at your current pace.`}
            />
            <ResultCard
              label="Estimated growth"
              value={formatGrowthCurrency(goalPlan.estimatedGrowth)}
              helper="Potential growth on the goal path."
            />
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.82fr] lg:items-start">
        <GrowthTimeline
          timeline={activeTimeline}
          title={mode === 'project' ? '3. Milestone timeline' : '3. Goal timeline'}
        />

        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0f3a5a] p-4 text-white shadow-lg shadow-[#0f3a5a]/14">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-white/66">
              <Sparkles size={16} />
              Foundation Note
            </div>
            <p className="text-sm leading-6 text-white/82">
              This tool is not trying to predict the market. It is showing how a repeated action can become a larger part of your financial foundation over time.
            </p>
          </div>

          <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-[#2b5676]/12">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#6f8aa3]">
              <BarChart3 size={16} />
              What moves the number?
            </div>
            <div className="space-y-3 text-sm leading-6 text-[#5a7690]">
              <p className="flex gap-2">
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#b8742a]" />
                More time usually does more than people expect.
              </p>
              <p className="flex gap-2">
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#b8742a]" />
                Consistent monthly contributions make the path easier to control.
              </p>
              <p className="flex gap-2">
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#b8742a]" />
                Higher returns can help, but they are the least controllable input.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#b8742a]/16 bg-[#b8742a]/8 p-4 text-sm leading-6 text-[#8a5a24]">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <Flag size={16} />
              Educational estimate
            </div>
            <p>
              Actual returns will vary. Use this as a planning tool, not a promise or investment recommendation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
