import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Calculator,
  Car,
  CheckCircle2,
  Clock3,
  Gauge,
  PiggyBank,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  calculateCarPaymentOpportunity,
  formatCarPaymentCurrency,
  type CarPaymentOpportunityInputs,
  type RedirectMode,
} from '../lib/carPaymentOpportunityCostEngine';

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  helper?: string;
};

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
  tone?: 'default' | 'dark' | 'warning' | 'growth';
};

type RedirectOptionProps = {
  mode: RedirectMode;
  activeMode: RedirectMode;
  title: string;
  body: string;
  onClick: (mode: RedirectMode) => void;
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
          min="0"
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

function MetricCard({ label, value, helper, icon, tone = 'default' }: MetricCardProps) {
  const toneClass =
    tone === 'dark'
      ? 'bg-[#0f3a5a] text-white ring-[#0f3a5a]/12 shadow-lg shadow-[#0f3a5a]/14'
      : tone === 'warning'
        ? 'bg-amber-50/90 text-amber-950 ring-amber-200/80'
        : tone === 'growth'
          ? 'bg-[#b8742a]/10 text-[#6d4318] ring-[#b8742a]/16'
          : 'bg-white/82 text-[#0f2a44] ring-[#2b5676]/12';

  const helperClass = tone === 'dark' ? 'text-white/72' : 'text-[#6f8aa3]';
  const iconClass = tone === 'dark' ? 'bg-white/12 text-white' : 'bg-[#b8742a]/10 text-[#8a5a24]';

  return (
    <div className={`rounded-2xl p-4 ring-1 ${toneClass}`}>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] opacity-80">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconClass}`}>{icon}</span>
        {label}
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className={`mt-2 text-sm leading-6 ${helperClass}`}>{helper}</p>
    </div>
  );
}

function RedirectOption({ mode, activeMode, title, body, onClick }: RedirectOptionProps) {
  const selected = mode === activeMode;

  return (
    <button
      type="button"
      onClick={() => onClick(mode)}
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
          <p className={`mt-1 text-sm leading-5 ${selected ? 'text-white/72' : 'text-[#6f8aa3]'}`}>{body}</p>
        </div>
      </div>
    </button>
  );
}

export default function CarPaymentOpportunityCostTool() {
  const [inputs, setInputs] = useState<CarPaymentOpportunityInputs>({
    monthlyPayment: 980,
    monthsLeft: 72,
    interestRateApr: 7,
    payoffBalance: 0,
    estimatedCarValue: 0,
    currentAge: 35,
    retirementAge: 65,
    expectedAnnualReturn: 8,
    redirectMode: 'full',
    customRedirectAmount: 500,
  });

  const result = useMemo(() => calculateCarPaymentOpportunity(inputs), [inputs]);

  const update = <Key extends keyof CarPaymentOpportunityInputs>(key: Key, value: CarPaymentOpportunityInputs[Key]) => {
    setInputs((previous) => ({ ...previous, [key]: value }));
  };

  const equityTone = result.equityStatus.tone === 'underwater' ? 'warning' : result.equityStatus.tone === 'positive' ? 'growth' : 'default';
  const yearsToRetirement = result.monthsToRetirement / 12;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] border border-[#2b5676]/12 bg-white/72 p-4 shadow-sm sm:p-5">
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff26_1px,transparent_1px)] bg-[size:22px_22px]" />
        </div>

        <div className="relative z-10 grid gap-4 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#b8742a]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a5a24]">
              <Car size={15} />
              Book scene calculator
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0f2a44]">
              See what your car payment is really costing — and what it could become.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5a7690]">
              In <span className="font-semibold text-[#0f2a44]">A Wealthy Foundation</span>, Ryan learns that a car payment is not just a monthly expense. It is future income already committed. Use this tool to see what your current payment could become if redirected toward margin, investing, or freedom.
            </p>
          </div>

          <div className="rounded-2xl bg-[#0f3a5a] p-4 text-white shadow-lg shadow-[#0f3a5a]/14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/62">
              Opportunity cost
            </p>
            <p className="mt-2 text-2xl font-semibold">{result.headline}</p>
            <p className="mt-2 text-sm leading-6 text-white/72">{result.insight}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">1. Current car obligation</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">
            Start with the payment, remaining timeline, and enough detail to estimate the real remaining cost.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <NumberField
            label="Monthly car payment"
            value={inputs.monthlyPayment}
            onChange={(value) => update('monthlyPayment', value)}
            prefix="$"
          />
          <NumberField
            label="Months left"
            value={inputs.monthsLeft}
            onChange={(value) => update('monthsLeft', value)}
            suffix="mo"
            helper="Loan or lease months remaining."
          />
          <NumberField
            label="Interest rate"
            value={inputs.interestRateApr}
            onChange={(value) => update('interestRateApr', value)}
            suffix="%"
            helper="Used to estimate interest if no payoff is entered."
          />
          <NumberField
            label="Payoff balance"
            value={inputs.payoffBalance}
            onChange={(value) => update('payoffBalance', value)}
            prefix="$"
            helper="Optional, but gives a better interest estimate."
          />
          <NumberField
            label="Estimated car value"
            value={inputs.estimatedCarValue}
            onChange={(value) => update('estimatedCarValue', value)}
            prefix="$"
            helper="Optional, used for equity/underwater check."
          />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Remaining payments"
          value={formatCarPaymentCurrency(result.totalRemainingPayments)}
          helper="Total dollars still scheduled to leave your monthly plan."
          icon={<Calculator size={16} />}
        />
        <MetricCard
          label="Estimated interest"
          value={formatCarPaymentCurrency(result.estimatedInterestPaid)}
          helper={inputs.payoffBalance > 0 ? 'Based on total remaining payments minus payoff balance.' : 'Estimated from payment, APR, and remaining months.'}
          icon={<Gauge size={16} />}
          tone="warning"
        />
        <MetricCard
          label="Income committed"
          value={result.yearsCommittedLabel}
          helper="How long this payment keeps part of your income spoken for."
          icon={<Clock3 size={16} />}
        />
        <MetricCard
          label={result.equityStatus.label}
          value={result.equityStatus.hasValues ? formatCarPaymentCurrency(Math.abs(result.equityStatus.equity)) : 'Add values'}
          helper={result.equityStatus.body}
          icon={<ShieldAlert size={16} />}
          tone={equityTone}
        />
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">2. Redirect the payment after it is gone</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">
            Model the full payment, the softer half-payment option, or a custom amount that fits real life.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <RedirectOption
            mode="full"
            activeMode={inputs.redirectMode}
            title="Invest the full payment"
            body="Turn the old payment into a future-focused monthly investment."
            onClick={(mode) => update('redirectMode', mode)}
          />
          <RedirectOption
            mode="half"
            activeMode={inputs.redirectMode}
            title="Keep half, invest half"
            body="Use half for breathing room and half for long-term growth."
            onClick={(mode) => update('redirectMode', mode)}
          />
          <RedirectOption
            mode="custom"
            activeMode={inputs.redirectMode}
            title="Choose my own amount"
            body="Redirect a specific dollar amount toward investing or freedom."
            onClick={(mode) => update('redirectMode', mode)}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <NumberField
            label="Current age"
            value={inputs.currentAge}
            onChange={(value) => update('currentAge', value)}
          />
          <NumberField
            label="Retirement age"
            value={inputs.retirementAge}
            onChange={(value) => update('retirementAge', value)}
            helper="Defaults to 65."
          />
          <NumberField
            label="Expected annual return"
            value={inputs.expectedAnnualReturn}
            onChange={(value) => update('expectedAnnualReturn', value)}
            suffix="%"
            helper="Defaults to 8%."
          />
          {inputs.redirectMode === 'custom' ? (
            <NumberField
              label="Custom redirected amount"
              value={inputs.customRedirectAmount}
              onChange={(value) => update('customRedirectAmount', value)}
              prefix="$"
            />
          ) : (
            <div className="rounded-2xl bg-white/78 p-3.5 ring-1 ring-[#2b5676]/12">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[#6f8aa3]">
                Redirected monthly
              </span>
              <div className="rounded-xl border border-[#2b5676]/12 bg-white/92 px-3 py-2.5 text-base font-semibold text-[#0f2a44]">
                {formatCarPaymentCurrency(result.selectedRedirectAmount)}
              </div>
              <span className="mt-1.5 block text-xs leading-5 text-[#6f8aa3]">Based on the selected scenario.</span>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.82fr] lg:items-start">
        <div className="rounded-2xl bg-white/82 p-4 ring-1 ring-[#2b5676]/12">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#6f8aa3]">
            <TrendingUp size={16} />
            What that payment could become
          </div>

          <div className="rounded-2xl bg-[#0f3a5a] p-5 text-white shadow-lg shadow-[#0f3a5a]/14">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/82">
                <RefreshCw size={15} />
                {result.selectedScenarioLabel}
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/54">
                {yearsToRetirement.toFixed(yearsToRetirement % 1 === 0 ? 0 : 1)} years modeled
              </span>
            </div>

            <p className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              {formatCarPaymentCurrency(result.selectedFuture.futureValue)}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/76">
              Redirecting {formatCarPaymentCurrency(result.selectedFuture.monthlyAmount)} per month until age {inputs.retirementAge} could create this projected value at {inputs.expectedAnnualReturn}% annual return.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/58">Your contributions</p>
                <p className="mt-2 text-2xl font-semibold">{formatCarPaymentCurrency(result.selectedFuture.totalContributions)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/58">Projected growth</p>
                <p className="mt-2 text-2xl font-semibold">{formatCarPaymentCurrency(result.selectedFuture.growthEarned)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Full payment path"
              value={formatCarPaymentCurrency(result.fullFuture.futureValue)}
              helper={`${formatCarPaymentCurrency(inputs.monthlyPayment)} redirected monthly.`}
              icon={<TrendingUp size={16} />}
              tone="growth"
            />
            <MetricCard
              label="Half payment path"
              value={formatCarPaymentCurrency(result.halfFuture.futureValue)}
              helper={`${formatCarPaymentCurrency(inputs.monthlyPayment / 2)} invested, ${formatCarPaymentCurrency(inputs.monthlyPayment / 2)} kept for breathing room.`}
              icon={<PiggyBank size={16} />}
            />
          </div>

          <div className="rounded-2xl bg-white/82 p-4 ring-1 ring-[#2b5676]/12">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#6f8aa3]">
              <Wallet size={16} />
              Foundation interpretation
            </div>
            <p className="text-sm leading-6 text-[#5a7690]">
              The goal is not extreme deprivation. The real opportunity is turning one old obligation into two forms of progress: more present margin and more future freedom.
            </p>
          </div>

          <div className="rounded-2xl bg-[#b8742a]/10 p-4 text-[#6d4318] ring-1 ring-[#b8742a]/16">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] opacity-80">
              <ArrowRight size={16} />
              Ryan's takeaway
            </div>
            <p className="text-sm leading-6">
              A car payment is not just transportation. It is a claim on future income. Once that claim disappears, the same cash flow can help build the life the payment was delaying.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
