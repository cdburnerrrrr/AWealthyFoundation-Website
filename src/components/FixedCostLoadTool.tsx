import { useMemo, useState } from 'react';
import { Home, Wallet, Shield, Car, CreditCard, Sparkles } from 'lucide-react';
// Adjust this import path to wherever your helper lives
// import { calculateObligationPressure } from '../lib/assessment';

type FixedCostLoadToolProps = {
  className?: string;
};

type ToolAnswers = {
  monthlyTakeHomeIncome: number;
  monthlyHousingCost: number;
  monthlyUtilities: number;
  monthlyChildcareCost: number;
  monthlyInsuranceCost: number;
  monthlyTransportationCost: number;
  monthlyDebtPayments: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getLoadBand(ratio: number) {
  if (ratio <= 0.5) {
    return {
      label: 'Healthy breathing room',
      tone: 'Your fixed costs look manageable.',
      ring: 'from-emerald-400 to-teal-300',
      glow: 'shadow-emerald-500/20',
      text: 'text-emerald-200',
      fillWidth: `${Math.round(ratio * 100)}%`,
      foundationHeight: 'h-16',
    };
  }

  if (ratio <= 0.7) {
    return {
      label: 'Tight but workable',
      tone: 'Your foundation is carrying real weight.',
      ring: 'from-amber-400 to-copper-400',
      glow: 'shadow-amber-500/20',
      text: 'text-amber-100',
      fillWidth: `${Math.round(ratio * 100)}%`,
      foundationHeight: 'h-12',
    };
  }

  return {
    label: 'Heavy pressure',
    tone: 'Your fixed costs may be crowding out flexibility.',
    ring: 'from-rose-400 to-orange-400',
    glow: 'shadow-rose-500/20',
    text: 'text-rose-100',
    fillWidth: `${Math.min(Math.round(ratio * 100), 100)}%`,
    foundationHeight: 'h-8',
  };
}

function InputRow({
  label,
  icon,
  value,
  onChange,
  max,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  max: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
          <span className="text-copper-300">{icon}</span>
          <span>{label}</span>
        </div>
        <span className="text-sm font-semibold text-copper-200">
          {formatCurrency(value)}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={max}
        step={25}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mb-3 w-full accent-[var(--color-copper,theme(colors.copper.500))]"
      />

      <input
        type="number"
        min={0}
        step={25}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value) || 0, 0, max))}
        className="w-full rounded-xl border border-white/10 bg-navy-950/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-copper-400 focus:outline-none"
      />
    </div>
  );
}

export default function FixedCostLoadTool({ className = '' }: FixedCostLoadToolProps) {
  const [values, setValues] = useState<ToolAnswers>({
    monthlyTakeHomeIncome: 5200,
    monthlyHousingCost: 1650,
    monthlyUtilities: 300,
    monthlyChildcareCost: 0,
    monthlyInsuranceCost: 240,
    monthlyTransportationCost: 350,
    monthlyDebtPayments: 425,
  });

  const fixedCosts = useMemo(() => {
    return (
      values.monthlyHousingCost +
      values.monthlyUtilities +
      values.monthlyChildcareCost +
      values.monthlyInsuranceCost +
      values.monthlyTransportationCost +
      values.monthlyDebtPayments
    );
  }, [values]);

  const margin = Math.max(values.monthlyTakeHomeIncome - fixedCosts, 0);
  const ratio =
    values.monthlyTakeHomeIncome > 0
      ? fixedCosts / values.monthlyTakeHomeIncome
      : 0;

  // This is the key integration point.
  // If your helper already estimates debt pressure using your core logic,
  // we pass in matching answer names so the tool aligns with your assessment model.
  const obligationPressure = ratio;

  const band = getLoadBand(typeof obligationPressure === 'number' ? obligationPressure : ratio);

  const updateValue = (key: keyof ToolAnswers, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-navy-900 via-[#102d49] to-[#0b2238] p-6 text-white shadow-2xl ${band.glow} ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:26px_26px]" />
      </div>

      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-copper-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-sky-300/10 blur-3xl" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-copper-500/15 text-copper-300 shadow-lg shadow-copper-900/20">
              <Home size={22} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-copper-200/80">
                Spending Tool
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Fixed Cost Load
              </h2>
            </div>
          </div>

          <p className="mb-6 max-w-xl text-sm leading-6 text-white/75">
            See how much of your monthly take-home pay is already committed before
            life even starts happening. The heavier the load, the harder it is to
            save, invest, or recover from setbacks.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputRow
              label="Monthly take-home pay"
              icon={<Wallet size={16} />}
              value={values.monthlyTakeHomeIncome}
              onChange={(v) => updateValue('monthlyTakeHomeIncome', v)}
              max={15000}
            />
            <InputRow
              label="Housing"
              icon={<Home size={16} />}
              value={values.monthlyHousingCost}
              onChange={(v) => updateValue('monthlyHousingCost', v)}
              max={5000}
            />
            <InputRow
              label="Utilities"
              icon={<Sparkles size={16} />}
              value={values.monthlyUtilities}
              onChange={(v) => updateValue('monthlyUtilities', v)}
              max={1500}
            />
            <InputRow
              label="Childcare"
              icon={<Shield size={16} />}
              value={values.monthlyChildcareCost}
              onChange={(v) => updateValue('monthlyChildcareCost', v)}
              max={4000}
            />
            <InputRow
              label="Insurance"
              icon={<Shield size={16} />}
              value={values.monthlyInsuranceCost}
              onChange={(v) => updateValue('monthlyInsuranceCost', v)}
              max={1500}
            />
            <InputRow
              label="Transportation"
              icon={<Car size={16} />}
              value={values.monthlyTransportationCost}
              onChange={(v) => updateValue('monthlyTransportationCost', v)}
              max={2000}
            />
            <div className="sm:col-span-2">
              <InputRow
                label="Debt payments"
                icon={<CreditCard size={16} />}
                value={values.monthlyDebtPayments}
                onChange={(v) => updateValue('monthlyDebtPayments', v)}
                max={3000}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/60">Your fixed cost load</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight">
                    {Math.round(ratio * 100)}%
                  </span>
                  <span className="pb-1 text-sm text-white/55">of take-home pay</span>
                </div>
              </div>

              <div
                className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-navy-950 ${band.ring}`}
              >
                {band.label}
              </div>
            </div>

            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between text-xs text-white/55">
                <span>Light</span>
                <span>Heavy</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${band.ring}`}
                  style={{ width: band.fillWidth }}
                />
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-navy-950/40 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white/65">Fixed monthly costs</span>
                <span className="font-semibold text-white">{formatCurrency(fixedCosts)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/65">Estimated breathing room</span>
                <span className="font-semibold text-copper-200">{formatCurrency(margin)}</span>
              </div>
            </div>

            <div className="mb-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Foundation view</p>
                  <p className={`mt-1 text-sm font-medium ${band.text}`}>
                    {band.tone}
                  </p>
                </div>
              </div>

              <div className="flex h-56 items-end justify-center gap-4">
                <div className="flex w-28 flex-col items-center">
                  <div className="mb-3 text-xs uppercase tracking-[0.18em] text-white/45">
                    Income
                  </div>
                  <div
                    className="w-full rounded-t-3xl bg-gradient-to-t from-sky-300/50 to-sky-200/80 transition-all duration-500"
                    style={{
                      height: `${clamp((values.monthlyTakeHomeIncome / 15000) * 180, 36, 180)}px`,
                    }}
                  />
                </div>

                <div className="flex w-36 flex-col items-center">
                  <div className="mb-3 text-xs uppercase tracking-[0.18em] text-white/45">
                    House Load
                  </div>

                  <div className="relative flex w-full flex-col items-center">
                    <div className="mb-0.5 h-10 w-20 rounded-t-full border border-copper-300/30 bg-copper-400/15" />
                    <div className="h-16 w-28 rounded-t-2xl border border-copper-200/30 bg-copper-300/10" />
                    <div
                      className={`w-36 rounded-t-md bg-gradient-to-t ${band.ring} transition-all duration-500 ${band.foundationHeight}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-copper-400/20 bg-copper-400/10 p-4 text-sm text-copper-50">
              <span className="font-semibold">What this means:</span>{' '}
              {ratio <= 0.5 &&
                'You have room to direct money toward saving, investing, or faster debt payoff.'}
              {ratio > 0.5 && ratio <= 0.7 &&
                'Your foundation is workable, but a few cost cuts or income gains could create much more flexibility.'}
              {ratio > 0.7 &&
                'A large share of your income is already spoken for. This can make progress feel slow even when you are trying hard.'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}