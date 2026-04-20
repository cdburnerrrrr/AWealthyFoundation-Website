import { useMemo, useState } from 'react';
import {
  Wallet,
  Home,
  UtensilsCrossed,
  Car,
  Shield,
  PiggyBank,
  CreditCard,
  Sparkles,
} from 'lucide-react';

type MonthlyMarginPlannerToolProps = {
  className?: string;
};

type PlannerValues = {
  monthlyTakeHomeIncome: number;
  housing: number;
  utilities: number;
  groceries: number;
  transportation: number;
  insurance: number;
  debtPayments: number;
  savingsGoal: number;
  funSpending: number;
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

export default function MonthlyMarginPlannerTool({
  className = '',
}: MonthlyMarginPlannerToolProps) {
  const [values, setValues] = useState<PlannerValues>({
    monthlyTakeHomeIncome: 5200,
    housing: 1650,
    utilities: 300,
    groceries: 650,
    transportation: 350,
    insurance: 240,
    debtPayments: 425,
    savingsGoal: 400,
    funSpending: 300,
  });

  const totalPlanned = useMemo(() => {
    return (
      values.housing +
      values.utilities +
      values.groceries +
      values.transportation +
      values.insurance +
      values.debtPayments +
      values.savingsGoal +
      values.funSpending
    );
  }, [values]);

  const margin = values.monthlyTakeHomeIncome - totalPlanned;
  const income = values.monthlyTakeHomeIncome || 1;

  const percentages = {
    housing: (values.housing / income) * 100,
    utilities: (values.utilities / income) * 100,
    groceries: (values.groceries / income) * 100,
    transportation: (values.transportation / income) * 100,
    insurance: (values.insurance / income) * 100,
    debtPayments: (values.debtPayments / income) * 100,
    savingsGoal: (values.savingsGoal / income) * 100,
    funSpending: (values.funSpending / income) * 100,
    margin: Math.max((margin / income) * 100, 0),
  };

  const status =
    margin >= 500
      ? {
          label: 'Strong margin',
          tone:
            'You have real breathing room. You can save, invest, or accelerate payoff without everything feeling tight.',
          chip: 'from-emerald-500 to-teal-400',
          text: 'text-emerald-700',
        }
      : margin >= 0
      ? {
          label: 'Tight margin',
          tone:
            'You still have room, but it is thinner than it looks. A few adjustments could create much more flexibility.',
          chip: 'from-amber-500 to-orange-400',
          text: 'text-amber-700',
        }
      : {
          label: 'Negative margin',
          tone:
            'More is going out than you planned for. That usually means debt, stress, or stalled progress starts creeping in.',
          chip: 'from-rose-500 to-orange-500',
          text: 'text-rose-700',
        };

  const updateValue = (key: keyof PlannerValues, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const flowRows = [
    { label: 'Housing', value: values.housing, percent: percentages.housing },
    { label: 'Utilities', value: values.utilities, percent: percentages.utilities },
    { label: 'Groceries', value: values.groceries, percent: percentages.groceries },
    { label: 'Transportation', value: values.transportation, percent: percentages.transportation },
    { label: 'Insurance', value: values.insurance, percent: percentages.insurance },
    { label: 'Debt Payments', value: values.debtPayments, percent: percentages.debtPayments },
    { label: 'Savings Goal', value: values.savingsGoal, percent: percentages.savingsGoal },
    { label: 'Fun Spending', value: values.funSpending, percent: percentages.funSpending },
  ];

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
              <Wallet size={22} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#b8742a]/80">Spending Tool</p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0f2a44]">Monthly Margin Planner</h2>
            </div>
          </div>

          <p className="mb-6 max-w-xl text-sm leading-6 text-[#325672]">
            Plan where your money goes before it disappears. This tool helps you see whether your current spending plan is creating progress or slowly boxing you in.
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
              value={values.housing}
              onChange={(v) => updateValue('housing', v)}
              max={5000}
            />
            <InputRow
              label="Utilities"
              icon={<Sparkles size={16} />}
              value={values.utilities}
              onChange={(v) => updateValue('utilities', v)}
              max={1500}
            />
            <InputRow
              label="Groceries"
              icon={<UtensilsCrossed size={16} />}
              value={values.groceries}
              onChange={(v) => updateValue('groceries', v)}
              max={2000}
            />
            <InputRow
              label="Transportation"
              icon={<Car size={16} />}
              value={values.transportation}
              onChange={(v) => updateValue('transportation', v)}
              max={2000}
            />
            <InputRow
              label="Insurance"
              icon={<Shield size={16} />}
              value={values.insurance}
              onChange={(v) => updateValue('insurance', v)}
              max={1500}
            />
            <InputRow
              label="Debt payments"
              icon={<CreditCard size={16} />}
              value={values.debtPayments}
              onChange={(v) => updateValue('debtPayments', v)}
              max={3000}
            />
            <InputRow
              label="Savings goal"
              icon={<PiggyBank size={16} />}
              value={values.savingsGoal}
              onChange={(v) => updateValue('savingsGoal', v)}
              max={3000}
            />
            <div className="sm:col-span-2">
              <InputRow
                label="Fun spending"
                icon={<Sparkles size={16} />}
                value={values.funSpending}
                onChange={(v) => updateValue('funSpending', v)}
                max={2000}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-[28px] border border-[#2b5676]/20 bg-white/78 p-5 backdrop-blur-sm shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[#5a7690]">Planned monthly margin</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-[#0f2a44]">{formatCurrency(Math.abs(margin))}</span>
                  <span className="pb-1 text-sm text-[#6b879d]">{margin >= 0 ? 'left over' : 'short'}</span>
                </div>
              </div>

              <div className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${status.chip}`}>
                {status.label}
              </div>
            </div>

            <div className="mb-5 rounded-2xl border border-[#2b5676]/16 bg-white/88 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[#5a7690]">Take-home income</span>
                <span className="font-semibold text-[#0f2a44]">{formatCurrency(values.monthlyTakeHomeIncome)}</span>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[#5a7690]">Total planned outflow</span>
                <span className="font-semibold text-[#0f2a44]">{formatCurrency(totalPlanned)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#5a7690]">Margin status</span>
                <span className={`font-semibold ${status.text}`}>{margin >= 0 ? 'Positive' : 'Negative'}</span>
              </div>
            </div>

            <div className="mb-5 rounded-3xl border border-[#2b5676]/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(233,245,252,0.88))] p-5">
              <div className="mb-4">
                <p className="text-sm text-[#5a7690]">Money flow</p>
                <p className={`mt-1 text-sm font-medium ${status.text}`}>{status.tone}</p>
              </div>

              <div className="space-y-3">
                {flowRows.map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-xs text-[#5a7690]">
                      <span>{row.label}</span>
                      <span>
                        {formatCurrency(row.value)} · {Math.round(row.percent)}%
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-[#d8ecf8]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#b8742a] to-sky-500 transition-all duration-500"
                        style={{ width: `${Math.min(row.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}

                {margin > 0 && (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-[#5a7690]">
                      <span>Remaining margin</span>
                      <span>
                        {formatCurrency(margin)} · {Math.round(percentages.margin)}%
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-[#d8ecf8]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                        style={{ width: `${Math.min(percentages.margin, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#b8742a]/18 bg-[#b8742a]/10 p-4 text-sm text-[#7a4e1d]">
              <span className="font-semibold text-[#6d4318]">What this means:</span>{' '}
              {margin >= 500 &&
                'You have enough room to be intentional. This is where real momentum starts to build.'}
              {margin >= 0 &&
                margin < 500 &&
                'You are not underwater, but your margin is thin enough that small surprises can knock you off track.'}
              {margin < 0 &&
                'Your current plan is overcommitted. That usually means something has to give: income up, spending down, or goals adjusted.'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
