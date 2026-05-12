import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Compass,
  CreditCard,
  Landmark,
  PiggyBank,
  Shield,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  calculateInvestmentPriority,
  formatPriorityCurrency,
  type InvestingExperience,
  type PrimaryGoal,
  type TaxSituation,
  type TimeHorizon,
} from '../lib/investmentPriorityEngine';

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  helper?: string;
};

type SelectFieldProps<Value extends string> = {
  label: string;
  value: Value;
  onChange: (value: Value) => void;
  options: { value: Value; label: string }[];
  helper?: string;
};

type ToggleCardProps = {
  title: string;
  body: string;
  selected: boolean;
  onClick: () => void;
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

function SelectField<Value extends string>({ label, value, onChange, options, helper }: SelectFieldProps<Value>) {
  return (
    <label className="block rounded-2xl bg-white/78 p-3.5 ring-1 ring-[#2b5676]/12 transition focus-within:ring-[#b8742a]/24">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[#6f8aa3]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Value)}
        className="w-full rounded-xl border border-[#2b5676]/12 bg-white/92 px-3 py-2.5 text-base font-semibold text-[#0f2a44] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helper && <span className="mt-1.5 block text-xs leading-5 text-[#6f8aa3]">{helper}</span>}
    </label>
  );
}

function ToggleCard({ title, body, selected, onClick }: ToggleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl p-4 text-left transition ${
        selected
          ? 'bg-[#0f3a5a] text-white shadow-lg shadow-[#0f3a5a]/18'
          : 'bg-white/80 text-[#0f2a44] ring-1 ring-[#2b5676]/12 hover:bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-white/12 text-white' : 'bg-[#b8742a]/10 text-[#8a5a24]'}`}>
          <CheckCircle2 size={17} />
        </span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className={`mt-1 text-sm leading-5 ${selected ? 'text-white/72' : 'text-[#6f8aa3]'}`}>
            {body}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function InvestmentPriorityFinderTool() {
  const [expanded, setExpanded] = useState(false);
  const [inputs, setInputs] = useState({
    monthlyTakeHomeIncome: 5000,
    monthlyEssentialExpenses: 3500,
    emergencyFundMonths: 2,
    highInterestDebtBalance: 2500,
    highestDebtApr: 19,
    employerMatchAvailable: true,
    currentWorkplaceContributionPercent: 3,
    fullMatchContributionPercent: 5,
    hsaEligible: false,
    taxSituation: 'middle' as TaxSituation,
    investingExperience: 'some' as InvestingExperience,
    timeHorizon: 'long' as TimeHorizon,
    primaryGoal: 'retirement' as PrimaryGoal,
  });

  const result = useMemo(() => calculateInvestmentPriority(inputs), [inputs]);

  const update = <Key extends keyof typeof inputs>(key: Key, value: (typeof inputs)[Key]) => {
    setInputs((previous) => ({ ...previous, [key]: value }));
  };

  const topToneClass =
    result.topMove.tone === 'stabilize'
      ? 'bg-amber-50/90 text-amber-900 ring-amber-200/80'
      : result.topMove.tone === 'protect'
        ? 'bg-sky-50/90 text-sky-950 ring-sky-200/80'
        : result.topMove.tone === 'capture'
          ? 'bg-emerald-50/90 text-emerald-950 ring-emerald-200/80'
          : 'bg-[#b8742a]/10 text-[#6d4318] ring-[#b8742a]/16';

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] border border-[#2b5676]/12 bg-white/72 p-4 shadow-sm sm:p-5">
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff26_1px,transparent_1px)] bg-[size:22px_22px]" />
        </div>

        <div className="relative z-10 grid gap-4 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#b8742a]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a5a24]">
              <Compass size={15} />
              Next-dollar decision
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0f2a44]">
              Find the next place your investment dollar should probably go.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5a7690]">
              This tool looks at cash flow, emergency savings, high-interest debt, employer match, tax buckets, and time horizon so investing decisions follow the foundation instead of jumping straight to complexity.
            </p>
          </div>

          <div className="rounded-2xl bg-[#0f3a5a] p-4 text-white shadow-lg shadow-[#0f3a5a]/14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/62">
              Foundation status
            </p>
            <p className="mt-2 text-2xl font-semibold">{result.statusLabel}</p>
            <p className="mt-2 text-sm leading-6 text-white/72">{result.statusBody}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">1. Foundation inputs</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">
            These inputs help decide whether the next dollar should stabilize, protect, capture match, or grow.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <NumberField
            label="Monthly take-home"
            value={inputs.monthlyTakeHomeIncome}
            onChange={(value) => update('monthlyTakeHomeIncome', value)}
            prefix="$"
          />
          <NumberField
            label="Essential expenses"
            value={inputs.monthlyEssentialExpenses}
            onChange={(value) => update('monthlyEssentialExpenses', value)}
            prefix="$"
            helper="Bills, housing, food, transport, minimum debt payments."
          />
          <NumberField
            label="Emergency fund"
            value={inputs.emergencyFundMonths}
            onChange={(value) => update('emergencyFundMonths', value)}
            suffix="mo"
          />
          <NumberField
            label="High-interest debt"
            value={inputs.highInterestDebtBalance}
            onChange={(value) => update('highInterestDebtBalance', value)}
            prefix="$"
          />
          <NumberField
            label="Highest debt APR"
            value={inputs.highestDebtApr}
            onChange={(value) => update('highestDebtApr', value)}
            suffix="%"
          />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">2. Investing access</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">
            This decides whether the easy win is a workplace match, HSA, retirement account, or another bucket.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <ToggleCard
            title="Employer match available"
            body="Your workplace offers a match if you contribute enough."
            selected={inputs.employerMatchAvailable}
            onClick={() => update('employerMatchAvailable', !inputs.employerMatchAvailable)}
          />
          <ToggleCard
            title="HSA eligible"
            body="You have access to an HSA and may be able to invest unused funds."
            selected={inputs.hsaEligible}
            onClick={() => update('hsaEligible', !inputs.hsaEligible)}
          />
        </div>

        {inputs.employerMatchAvailable && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <NumberField
              label="Current workplace contribution"
              value={inputs.currentWorkplaceContributionPercent}
              onChange={(value) => update('currentWorkplaceContributionPercent', value)}
              suffix="%"
            />
            <NumberField
              label="Full match contribution"
              value={inputs.fullMatchContributionPercent}
              onChange={(value) => update('fullMatchContributionPercent', value)}
              suffix="%"
              helper="Example: 5 means full match requires 5% of pay."
            />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">3. Goal context</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">
            Account order depends on timeline, taxes, and whether this is a short-term or long-term goal.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SelectField<TaxSituation>
            label="Tax situation"
            value={inputs.taxSituation}
            onChange={(value) => update('taxSituation', value)}
            options={[
              { value: 'low', label: 'Lower tax bracket' },
              { value: 'middle', label: 'Middle tax bracket' },
              { value: 'high', label: 'Higher tax bracket' },
              { value: 'not_sure', label: 'Not sure' },
            ]}
          />
          <SelectField<InvestingExperience>
            label="Investing habit"
            value={inputs.investingExperience}
            onChange={(value) => update('investingExperience', value)}
            options={[
              { value: 'not_started', label: 'Not started yet' },
              { value: 'some', label: 'Some investing' },
              { value: 'consistent', label: 'Consistent investor' },
            ]}
          />
          <SelectField<TimeHorizon>
            label="Time horizon"
            value={inputs.timeHorizon}
            onChange={(value) => update('timeHorizon', value)}
            options={[
              { value: 'short', label: '0–3 years' },
              { value: 'medium', label: '3–10 years' },
              { value: 'long', label: '10+ years' },
            ]}
          />
          <SelectField<PrimaryGoal>
            label="Primary goal"
            value={inputs.primaryGoal}
            onChange={(value) => update('primaryGoal', value)}
            options={[
              { value: 'retirement', label: 'Retirement' },
              { value: 'house', label: 'House / major purchase' },
              { value: 'education', label: 'Education' },
              { value: 'financial_freedom', label: 'Financial freedom' },
              { value: 'general', label: 'General wealth building' },
            ]}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">4. Your likely next move</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">
            This is a planning sequence, not formal financial advice. Use it to decide what deserves a closer look first.
          </p>
        </div>

        <div className={`rounded-2xl p-5 ring-1 ${topToneClass}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
              <Target size={15} />
              {result.topMove.badge}
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">
              Top priority
            </span>
          </div>

          <h3 className="mt-3 text-2xl font-semibold">{result.topMove.title}</h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 opacity-90">{result.topMove.body}</p>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl bg-white/56 p-4 ring-1 ring-white/50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] opacity-70">Why</p>
              <p className="mt-2 text-sm leading-6">{result.topMove.why}</p>
            </div>
            <div className="rounded-2xl bg-white/56 p-4 ring-1 ring-white/50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] opacity-70">Action</p>
              <p className="mt-2 text-sm leading-6">{result.topMove.action}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.82fr] lg:items-start">
        <div className="rounded-2xl bg-white/82 p-4 ring-1 ring-[#2b5676]/12">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#6f8aa3]">
            <BarChart3 size={16} />
            Priority ladder
          </div>

          <div className="space-y-3">
            {result.rankedMoves.map((move, index) => (
              <div key={move.key} className="rounded-2xl bg-white/78 p-4 ring-1 ring-[#2b5676]/10">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#b8742a]/10 text-sm font-semibold text-[#8a5a24]">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-[#0f2a44]">{move.title}</h4>
                      <span className="rounded-full bg-[#edf6fb] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5a7690]">
                        {move.badge}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-[#5a7690]">{move.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-[#2b5676]/12">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#6f8aa3]">
                <Wallet size={16} />
                Monthly margin
              </div>
              <p className="text-2xl font-semibold text-[#0f2a44]">{formatPriorityCurrency(result.monthlyMargin)}</p>
              <p className="mt-2 text-sm text-[#6f8aa3]">After modeled essentials.</p>
            </div>

            <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-[#2b5676]/12">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#6f8aa3]">
                <Shield size={16} />
                Fixed cost load
              </div>
              <p className="text-2xl font-semibold text-[#0f2a44]">{result.fixedCostLoad}%</p>
              <p className="mt-2 text-sm text-[#6f8aa3]">Essentials divided by take-home pay.</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0f3a5a] p-4 text-white shadow-lg shadow-[#0f3a5a]/14">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-white/66">
              <TrendingUp size={16} />
              Foundation Note
            </div>
            <p className="text-sm leading-6 text-white/82">
              The next investing dollar should follow the structure of the house: stabilize the floor, protect the walls, capture easy wins, then add growth.
            </p>
          </div>

          {result.flags.length > 0 && (
            <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-[#2b5676]/12">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#6f8aa3]">
                <AlertTriangle size={16} />
                Watch areas
              </div>
              <div className="space-y-3 text-sm leading-6 text-[#5a7690]">
                {result.flags.map((flag) => (
                  <p key={flag} className="flex gap-2">
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#b8742a]" />
                    {flag}
                  </p>
                ))}
              </div>
            </div>
          )}

          <section className="rounded-2xl bg-white/80 ring-1 ring-[#2b5676]/12">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0f2a44]">
                <Landmark size={16} />
                How the ladder works
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/86 text-[#5a7690] ring-1 ring-[#2b5676]/10">
                <ChevronDown size={18} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {expanded && (
              <div className="border-t border-[#2b5676]/10 px-4 pb-4 pt-3 text-sm leading-6 text-[#5a7690]">
                <p>
                  The tool prioritizes cash-flow stress, emergency savings, high-interest debt, employer match, tax-advantaged accounts, and then flexible taxable investing. It is intentionally conservative because investing works better when the money can stay invested.
                </p>
                <div className="mt-3 grid gap-2">
                  <p className="flex gap-2"><PiggyBank className="mt-1 h-4 w-4 shrink-0 text-[#b8742a]" /> Protect short-term stability before chasing long-term upside.</p>
                  <p className="flex gap-2"><CreditCard className="mt-1 h-4 w-4 shrink-0 text-[#b8742a]" /> Treat high-interest debt as competition for investment growth.</p>
                  <p className="flex gap-2"><Landmark className="mt-1 h-4 w-4 shrink-0 text-[#b8742a]" /> Capture workplace match when the monthly plan can support it.</p>
                </div>
                <p className="mt-3">
                  This is an educational planning tool, not personalized investment, legal, or tax advice.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
