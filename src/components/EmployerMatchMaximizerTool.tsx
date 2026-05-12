import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Calculator,
  ChevronDown,
  ClipboardCheck,
  Info,
  Landmark,
  Percent,
  TrendingUp,
} from 'lucide-react';
import {
  calculateEmployerMatch,
  formatMatchCurrency,
  getFormulaLabel,
  type EmployerMatchFormula,
} from '../lib/employerMatchEngine';

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

const FORMULA_OPTIONS: {
  value: EmployerMatchFormula;
  title: string;
  body: string;
}[] = [
  {
    value: 'tiered_100_50',
    title: 'Common tiered match',
    body: '100% on the first 3%, then 50% on the next 2%.',
  },
  {
    value: 'dollar_for_dollar',
    title: 'Dollar-for-dollar',
    body: 'Employer matches 100% of your contribution up to a limit.',
  },
  {
    value: 'half_match',
    title: '50% match',
    body: 'Employer matches half of your contribution up to a limit.',
  },
  {
    value: 'custom',
    title: 'Custom',
    body: 'Enter the employer match rate and employee contribution limit.',
  },
];

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

export default function EmployerMatchMaximizerTool() {
  const [expanded, setExpanded] = useState(false);
  const [inputs, setInputs] = useState({
    annualSalary: 65000,
    currentContributionPercent: 3,
    currentBalance: 25000,
    years: 20,
    annualReturn: 7,
    formula: 'tiered_100_50' as EmployerMatchFormula,
    dollarMatchLimitPercent: 4,
    halfMatchLimitPercent: 6,
    customEmployeeLimitPercent: 6,
    customMatchRatePercent: 50,
  });

  const result = useMemo(() => calculateEmployerMatch(inputs), [inputs]);

  const update = <Key extends keyof typeof inputs>(key: Key, value: (typeof inputs)[Key]) => {
    setInputs((previous) => ({ ...previous, [key]: value }));
  };

  const progressWidth = `${Math.max(0, Math.min(100, result.capturedPercent))}%`;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] border border-[#2b5676]/12 bg-white/72 p-4 shadow-sm sm:p-5">
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff26_1px,transparent_1px)] bg-[size:22px_22px]" />
        </div>

        <div className="relative z-10 grid gap-4 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#b8742a]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a5a24]">
              <BadgeDollarSign size={15} />
              Workplace investing check
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0f2a44]">
              Find out whether you are capturing the full employer match.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5a7690]">
              A workplace match is one of the cleanest investing wins because it rewards the dollars you already planned to invest. This tool estimates the gap between your current contribution and the full match path.
            </p>
          </div>

          <div className="rounded-2xl bg-[#0f3a5a] p-4 text-white shadow-lg shadow-[#0f3a5a]/14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/62">
              Match captured
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-4xl font-semibold">{result.capturedPercent}%</p>
              <p className="pb-1 text-sm text-white/68">of available match</p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/12">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#77a9bf] to-[#d9a261] transition-all duration-300"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">1. Your current plan</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">
            Use eligible annual pay, not take-home pay, because most workplace matches are based on gross compensation.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <NumberField
            label="Eligible annual pay"
            value={inputs.annualSalary}
            onChange={(value) => update('annualSalary', value)}
            prefix="$"
          />
          <NumberField
            label="Current contribution"
            value={inputs.currentContributionPercent}
            onChange={(value) => update('currentContributionPercent', value)}
            suffix="%"
          />
          <NumberField
            label="Current balance"
            value={inputs.currentBalance}
            onChange={(value) => update('currentBalance', value)}
            prefix="$"
            helper="Optional, for long-term comparison."
          />
          <NumberField
            label="Years to model"
            value={inputs.years}
            onChange={(value) => update('years', value)}
            suffix="yrs"
          />
          <NumberField
            label="Estimated return"
            value={inputs.annualReturn}
            onChange={(value) => update('annualReturn', value)}
            suffix="%"
            helper="Educational estimate, not a guarantee."
          />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">2. Employer match formula</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">
            Pick the closest formula from your plan documents. If you are not sure, the common tiered match is a reasonable example to test.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          {FORMULA_OPTIONS.map((option) => {
            const selected = inputs.formula === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => update('formula', option.value)}
                className={`rounded-2xl p-4 text-left transition ${
                  selected
                    ? 'bg-[#0f3a5a] text-white shadow-lg shadow-[#0f3a5a]/18'
                    : 'bg-white/80 text-[#0f2a44] ring-1 ring-[#2b5676]/12 hover:bg-white'
                }`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#b8742a]/10 text-[#b8742a]">
                  {option.value === 'custom' ? <Calculator size={20} /> : <Percent size={20} />}
                </div>
                <p className="font-semibold">{option.title}</p>
                <p className={`mt-1 text-sm leading-5 ${selected ? 'text-white/72' : 'text-[#6f8aa3]'}`}>
                  {option.body}
                </p>
              </button>
            );
          })}
        </div>

        {inputs.formula !== 'tiered_100_50' && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {inputs.formula === 'dollar_for_dollar' && (
              <NumberField
                label="Match limit"
                value={inputs.dollarMatchLimitPercent}
                onChange={(value) => update('dollarMatchLimitPercent', value)}
                suffix="%"
                helper="Example: 4 means 100% match up to 4% of pay."
              />
            )}

            {inputs.formula === 'half_match' && (
              <NumberField
                label="Employee limit"
                value={inputs.halfMatchLimitPercent}
                onChange={(value) => update('halfMatchLimitPercent', value)}
                suffix="%"
                helper="Example: 6 means 50% match up to 6% of pay."
              />
            )}

            {inputs.formula === 'custom' && (
              <>
                <NumberField
                  label="Employer match rate"
                  value={inputs.customMatchRatePercent}
                  onChange={(value) => update('customMatchRatePercent', value)}
                  suffix="%"
                  helper="Example: 50 means employer matches 50 cents per dollar."
                />
                <NumberField
                  label="Employee limit"
                  value={inputs.customEmployeeLimitPercent}
                  onChange={(value) => update('customEmployeeLimitPercent', value)}
                  suffix="%"
                  helper="Contribution percent where the match maxes out."
                />
              </>
            )}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">3. Your match opportunity</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">
            Current formula: {getFormulaLabel(inputs.formula)}.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          <ResultCard
            label="Current match"
            value={formatMatchCurrency(result.currentAnnualEmployerMatch)}
            helper="Estimated employer match per year at your current contribution."
          />
          <ResultCard
            label="Full match"
            value={formatMatchCurrency(result.fullAnnualEmployerMatch)}
            helper={`Requires about ${result.requiredContributionPercent}% of pay.`}
            highlight
          />
          <ResultCard
            label="Missed match"
            value={formatMatchCurrency(result.missedAnnualMatch)}
            helper="Estimated employer dollars left uncaptured each year."
          />
          <ResultCard
            label="Monthly increase"
            value={formatMatchCurrency(result.additionalMonthlyContribution)}
            helper={`About ${result.additionalContributionPercent}% more of pay.`}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.82fr] lg:items-start">
        <div className="rounded-2xl bg-white/82 p-4 ring-1 ring-[#2b5676]/12">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#6f8aa3]">
            <BarChart3 size={16} />
            Long-term comparison
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ResultCard
              label="Current path"
              value={formatMatchCurrency(result.projectedCurrentPathValue)}
              helper={`Current contribution plus current match over ${inputs.years} years.`}
            />
            <ResultCard
              label="Full-match path"
              value={formatMatchCurrency(result.projectedFullMatchPathValue)}
              helper="Contribution level needed to capture the full match."
              highlight
            />
            <ResultCard
              label="Missed match value"
              value={formatMatchCurrency(result.projectedMissedMatchValue)}
              helper="Potential future value of uncaptured employer match."
            />
          </div>

          <div className="mt-4 rounded-2xl border border-[#b8742a]/16 bg-[#b8742a]/8 p-4 text-sm leading-6 text-[#8a5a24]">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <ClipboardCheck size={16} />
              {result.recommendationLabel}
            </div>
            <p>{result.recommendationBody}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0f3a5a] p-4 text-white shadow-lg shadow-[#0f3a5a]/14">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-white/66">
              <TrendingUp size={16} />
              Foundation Note
            </div>
            <p className="text-sm leading-6 text-white/82">
              The match is not a complicated investing decision. It is a simple foundation leak check: are you capturing the employer dollars already available to you?
            </p>
          </div>

          <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-[#2b5676]/12">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#6f8aa3]">
              <Landmark size={16} />
              Before increasing
            </div>
            <div className="space-y-3 text-sm leading-6 text-[#5a7690]">
              <p className="flex gap-2">
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#b8742a]" />
                Make sure your emergency cushion and required bills can handle the higher contribution.
              </p>
              <p className="flex gap-2">
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#b8742a]" />
                Check whether your plan has vesting rules before treating the full match as guaranteed.
              </p>
              <p className="flex gap-2">
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#b8742a]" />
                Use your plan document for the exact formula if your employer match is unusual.
              </p>
            </div>
          </div>

          <section className="rounded-2xl bg-white/80 ring-1 ring-[#2b5676]/12">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0f2a44]">
                <Info size={16} />
                Calculation notes
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/86 text-[#5a7690] ring-1 ring-[#2b5676]/10">
                <ChevronDown size={18} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {expanded && (
              <div className="border-t border-[#2b5676]/10 px-4 pb-4 pt-3 text-sm leading-6 text-[#5a7690]">
                <p>
                  This tool estimates the employer match using eligible annual pay and your current contribution percent. It does not account for IRS limits, vesting schedules, fees, taxes, payroll timing, or plan-specific rules.
                </p>
                <p className="mt-3">
                  Actual returns will vary. Use this as an educational planning tool, not a promise or investment recommendation.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
