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
          chip: 'from-emerald-400 to-teal-300',
          text: 'text-emerald-100',
        }
      : margin >= 0
      ? {
          label: 'Tight margin',
          tone:
            'You still have room, but it is thinner than it looks. A few adjustments could create much more flexibility.',
          chip: 'from-amber-400 to-copper-400',
          text: 'text-amber-100',
        }
      : {
          label: 'Negative margin',
          tone:
            'More is going out than you planned for. That usually means debt, stress, or stalled progress starts creeping in.',
          chip: 'from-rose-400 to-orange-400',
          text: 'text-rose-100',
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
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#102d49] via-navy-900 to-[#0b2238] p-6 text-white shadow-2xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:26px_26px]" />
      </div>

      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-copper-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-sky-300/10 blur-3xl" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-copper-500/15 text-copper-300 shadow-lg shadow-copper-900/20">
              <Wallet size={22} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-copper-200/80">
                Spending Tool
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Monthly Margin Planner
              </h2>
            </div>
          </div>

          <p className="mb-6 max-w-xl text-sm leading-6 text-white/75">
            Plan where your money goes before it disappears. This tool helps you
            see whether your current spending plan is creating progress or slowly
            boxing you in.
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
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/60">Planned monthly margin</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight">
                    {formatCurrency(Math.abs(margin))}
                  </span>
                  <span className="pb-1 text-sm text-white/55">
                    {margin >= 0 ? 'left over' : 'short'}
                  </span>
                </div>
              </div>

              <div
                className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-navy-950 ${status.chip}`}
              >
                {status.label}
              </div>
            </div>

            <div className="mb-5 rounded-2xl border border-white/10 bg-navy-950/40 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white/65">Take-home income</span>
                <span className="font-semibold text-white">
                  {formatCurrency(values.monthlyTakeHomeIncome)}
                </span>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white/65">Total planned outflow</span>
                <span className="font-semibold text-white">
                  {formatCurrency(totalPlanned)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/65">Margin status</span>
                <span className={`font-semibold ${status.text}`}>
                  {margin >= 0 ? 'Positive' : 'Negative'}
                </span>
              </div>
            </div>

            <div className="mb-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] p-5">
              <div className="mb-4">
                <p className="text-sm text-white/60">Money flow</p>
                <p className={`mt-1 text-sm font-medium ${status.text}`}>
                  {status.tone}
                </p>
              </div>

              <div className="space-y-3">
                {flowRows.map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-xs text-white/65">
                      <span>{row.label}</span>
                      <span>
                        {formatCurrency(row.value)} · {Math.round(row.percent)}%
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-copper-400 to-sky-300 transition-all duration-500"
                        style={{ width: `${Math.min(row.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}

                {margin > 0 && (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-white/65">
                      <span>Remaining margin</span>
                      <span>
                        {formatCurrency(margin)} · {Math.round(percentages.margin)}%
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500"
                        style={{ width: `${Math.min(percentages.margin, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-copper-400/20 bg-copper-400/10 p-4 text-sm text-copper-50">
              <span className="font-semibold">What this means:</span>{' '}
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