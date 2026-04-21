import { useMemo, useState } from 'react';
import { AlertTriangle, CreditCard, Home, Sparkles, Wallet } from 'lucide-react';

type DebtPressureCheckToolProps = {
  className?: string;
};

type DebtPressureValues = {
  monthlyTakeHomeIncome: number;
  monthlyHousingCost: number;
  monthlyUtilities: number;
  monthlyDebtPayments: number;
  groceriesAndEssentials: number;
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

export default function DebtPressureCheckTool({ className = '' }: DebtPressureCheckToolProps) {
  const [values, setValues] = useState<DebtPressureValues>({
    monthlyTakeHomeIncome: 5200,
    monthlyHousingCost: 1650,
    monthlyUtilities: 300,
    monthlyDebtPayments: 425,
    groceriesAndEssentials: 700,
  });

  const updateValue = (key: keyof DebtPressureValues, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const essentials = useMemo(() => {
    return (
      values.monthlyHousingCost +
      values.monthlyUtilities +
      values.monthlyDebtPayments +
      values.groceriesAndEssentials
    );
  }, [values]);

  const debtRatio = values.monthlyTakeHomeIncome > 0
    ? values.monthlyDebtPayments / values.monthlyTakeHomeIncome
    : 0;

  const obligationRatio = values.monthlyTakeHomeIncome > 0
    ? essentials / values.monthlyTakeHomeIncome
    : 0;

  const breathingRoom = Math.max(values.monthlyTakeHomeIncome - essentials, 0);

  const status =
    obligationRatio <= 0.5
      ? {
          label: 'Manageable pressure',
          chip: 'from-emerald-500 to-teal-400',
          text: 'text-emerald-700',
          tone: 'Your debt load looks workable relative to your overall monthly obligations.',
          meter: `${Math.round(obligationRatio * 100)}%`,
        }
      : obligationRatio <= 0.7
      ? {
          label: 'Building pressure',
          chip: 'from-amber-500 to-orange-400',
          text: 'text-amber-700',
          tone: 'Debt may not be the only issue, but it is adding real weight to an already tight monthly picture.',
          meter: `${Math.round(obligationRatio * 100)}%`,
        }
      : {
          label: 'Heavy pressure',
          chip: 'from-rose-500 to-orange-500',
          text: 'text-rose-700',
          tone: 'Debt is likely making everything else harder. The monthly load is crowding out flexibility.',
          meter: `${Math.min(Math.round(obligationRatio * 100), 100)}%`,
        };

  return (
    <section
      className={`relative overflow-hidden rounded-[28px] border border-[#2b5676]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,251,255,0.94))] p-6 text-[#153b58] shadow-2xl ${className}`}
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

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b8742a]/12 text-[#b8742a] shadow-lg shadow-[#b8742a]/10">
              <CreditCard size={22} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#b8742a]/80">Debt Tool</p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0f2a44]">
                Debt Pressure Check
              </h2>
            </div>
          </div>

          <p className="mb-6 max-w-xl text-sm leading-6 text-[#325672]">
            Measure how much your debt payments are squeezing your month once housing,
            utilities, and essentials are already accounted for.
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
              label="Debt payments"
              icon={<CreditCard size={16} />}
              value={values.monthlyDebtPayments}
              onChange={(v) => updateValue('monthlyDebtPayments', v)}
              max={3500}
            />
            <div className="sm:col-span-2">
              <InputRow
                label="Groceries + essentials"
                icon={<AlertTriangle size={16} />}
                value={values.groceriesAndEssentials}
                onChange={(v) => updateValue('groceriesAndEssentials', v)}
                max={2500}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-[28px] border border-[#2b5676]/20 bg-white/78 p-5 backdrop-blur-sm shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[#5a7690]">Debt pressure score</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-[#0f2a44]">
                    {Math.round(debtRatio * 100)}%
                  </span>
                  <span className="pb-1 text-sm text-[#6b879d]">debt / income</span>
                </div>
              </div>

              <div className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${status.chip}`}>
                {status.label}
              </div>
            </div>

            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between text-xs text-[#6b879d]">
                <span>Low</span>
                <span>High</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-[#d8ecf8]">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${status.chip}`}
                  style={{ width: status.meter }}
                />
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-[#2b5676]/16 bg-white/88 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[#5a7690]">Debt payments</span>
                <span className="font-semibold text-[#0f2a44]">
                  {formatCurrency(values.monthlyDebtPayments)}
                </span>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[#5a7690]">Essential monthly load</span>
                <span className="font-semibold text-[#0f2a44]">
                  {formatCurrency(essentials)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#5a7690]">Estimated breathing room</span>
                <span className="font-semibold text-[#b8742a]">
                  {formatCurrency(breathingRoom)}
                </span>
              </div>
            </div>

            <div className="mb-5 rounded-3xl border border-[#2b5676]/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(233,245,252,0.88))] p-5">
              <div className="mb-4">
                <p className="text-sm text-[#5a7690]">Pressure view</p>
                <p className={`mt-1 text-sm font-medium ${status.text}`}>{status.tone}</p>
              </div>

              <div className="space-y-3">
                {[
                  ['Housing', values.monthlyHousingCost],
                  ['Utilities', values.monthlyUtilities],
                  ['Debt', values.monthlyDebtPayments],
                  ['Essentials', values.groceriesAndEssentials],
                ].map(([label, value]) => {
                  const percent = values.monthlyTakeHomeIncome > 0 ? (Number(value) / values.monthlyTakeHomeIncome) * 100 : 0;
                  return (
                    <div key={label}>
                      <div className="mb-1 flex items-center justify-between text-xs text-[#5a7690]">
                        <span>{label}</span>
                        <span>{formatCurrency(Number(value))} · {Math.round(percent)}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-[#d8ecf8]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#b8742a] to-sky-500 transition-all duration-500"
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#b8742a]/18 bg-[#b8742a]/10 p-4 text-sm text-[#7a4e1d]">
              <span className="font-semibold text-[#6d4318]">What this means:</span>{' '}
              {obligationRatio <= 0.5 &&
                'Your debt load looks manageable relative to the rest of your monthly obligations.'}
              {obligationRatio > 0.5 && obligationRatio <= 0.7 &&
                'Debt is adding noticeable pressure. You may still be functioning, but flexibility is getting thinner.'}
              {obligationRatio > 0.7 &&
                'Debt is likely crowding out progress. Faster payoff, lower expenses, or higher income would have the biggest impact.'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
