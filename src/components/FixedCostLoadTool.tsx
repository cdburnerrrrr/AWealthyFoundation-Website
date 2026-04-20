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
      ring: 'from-emerald-500 to-teal-400',
      glow: 'shadow-emerald-600/15',
      text: 'text-emerald-700',
      fillWidth: `${Math.round(ratio * 100)}%`,
      foundationHeight: 'h-16',
    };
  }

  if (ratio <= 0.7) {
    return {
      label: 'Tight but workable',
      tone: 'Your foundation is carrying real weight.',
      ring: 'from-amber-500 to-orange-400',
      glow: 'shadow-amber-600/15',
      text: 'text-amber-700',
      fillWidth: `${Math.round(ratio * 100)}%`,
      foundationHeight: 'h-12',
    };
  }

  return {
    label: 'Heavy pressure',
    tone: 'Your fixed costs may be crowding out flexibility.',
    ring: 'from-rose-500 to-orange-500',
    glow: 'shadow-rose-600/15',
    text: 'text-rose-700',
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
    <div className="rounded-2xl border border-[#2b5676]/20 bg-white/78 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[#153b58]">
          <span className="text-[#b8742a]">{icon}</span>
          <span>{label}</span>
        </div>
        <span className="text-sm font-semibold text-[#b8742a]">{formatCurrency(value)}</span>
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
        className="w-full rounded-xl border border-[#2b5676]/20 bg-white/90 px-3 py-2 text-sm text-[#153b58] placeholder:text-[#6c89a0] focus:border-[#b8742a] focus:outline-none"
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

  const obligationPressure = ratio;
  const band = getLoadBand(typeof obligationPressure === 'number' ? obligationPressure : ratio);

  const updateValue = (key: keyof ToolAnswers, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section
      className={`relative overflow-hidden rounded-[28px] border border-[#2b5676]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,251,255,0.94))] p-6 text-[#153b58] shadow-2xl ${band.glow} ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a26_1px,transparent_1px),linear-gradient(to_bottom,#0f3a5a26_1px,transparent_1px)] bg-[size:26px_26px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(circle_at_1px_1px,#0f3a5a_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="pointer-events-none absolute left-[7%] top-8 h-36 w-36 rounded-full border border-[#0f3a5a]/25" />
      <div className="pointer-events-none absolute right-[8%] top-10 h-0 w-40 border-t border-dashed border-[#0f3a5a]/30" />
      <div className="pointer-events-none absolute bottom-10 right-[10%] h-24 w-24 rounded-full border border-[#0f3a5a]/20" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#b8742a]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b8742a]/12 text-[#b8742a] shadow-lg shadow-[#b8742a]/10">
              <Home size={22} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#b8742a]/80">
                Spending Tool
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0f2a44]">
                Fixed Cost Load
              </h2>
            </div>
          </div>

          <p className="mb-6 max-w-xl text-sm leading-6 text-[#325672]">
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
          <div className="rounded-[28px] border border-[#2b5676]/20 bg-white/78 p-5 backdrop-blur-sm shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[#5a7690]">Your fixed cost load</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-[#0f2a44]">
                    {Math.round(ratio * 100)}%
                  </span>
                  <span className="pb-1 text-sm text-[#6b879d]">of take-home pay</span>
                </div>
              </div>

              <div
                className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${band.ring}`}
              >
                {band.label}
              </div>
            </div>

            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between text-xs text-[#6b879d]">
                <span>Light</span>
                <span>Heavy</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-[#d8ecf8]">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${band.ring}`}
                  style={{ width: band.fillWidth }}
                />
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-[#2b5676]/16 bg-white/88 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[#5a7690]">Fixed monthly costs</span>
                <span className="font-semibold text-[#0f2a44]">{formatCurrency(fixedCosts)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#5a7690]">Estimated breathing room</span>
                <span className="font-semibold text-[#b8742a]">{formatCurrency(margin)}</span>
              </div>
            </div>

            <div className="mb-5 rounded-3xl border border-[#2b5676]/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(233,245,252,0.88))] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5a7690]">Foundation view</p>
                  <p className={`mt-1 text-sm font-medium ${band.text}`}>
                    {band.tone}
                  </p>
                </div>
              </div>

              <div className="flex h-56 items-end justify-center gap-4">
                <div className="flex w-28 flex-col items-center">
                  <div className="mb-3 text-xs uppercase tracking-[0.18em] text-[#6b879d]">
                    Income
                  </div>
                  <div
                    className="w-full rounded-t-3xl bg-gradient-to-t from-sky-400/55 to-sky-200/90 transition-all duration-500"
                    style={{
                      height: `${clamp((values.monthlyTakeHomeIncome / 15000) * 180, 36, 180)}px`,
                    }}
                  />
                </div>

                <div className="flex w-36 flex-col items-center">
                  <div className="mb-3 text-xs uppercase tracking-[0.18em] text-[#6b879d]">
                    House Load
                  </div>

                  <div className="relative flex w-full flex-col items-center">
                    <div className="mb-0.5 h-10 w-20 rounded-t-full border border-[#b8742a]/30 bg-[#b8742a]/12" />
                    <div className="h-16 w-28 rounded-t-2xl border border-[#b8742a]/25 bg-[#b8742a]/10" />
                    <div
                      className={`w-36 rounded-t-md bg-gradient-to-t ${band.ring} transition-all duration-500 ${band.foundationHeight}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#b8742a]/18 bg-[#b8742a]/10 p-4 text-sm text-[#7a4e1d]">
              <span className="font-semibold text-[#6d4318]">What this means:</span>{' '}
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
