import React, { useMemo, useState } from 'react';
import { Calculator, Home, PiggyBank, TrendingUp, CreditCard, ArrowRight } from 'lucide-react';

type NetWorthInputs = {
  totalLiquidSavings?: number;
  totalInvestments?: number;
  homeValue?: number;
  mortgageBalance?: number;
  totalDebtBalance?: number;
};

type NetWorthActivityProps = {
  initialValues?: NetWorthInputs;
  onComplete?: (payload: { netWorth: number; assets: number; liabilities: number }) => void;
};

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getNetWorthMessage(netWorth: number) {
  if (netWorth < 0) {
    return {
      title: 'Shaky Foundation',
      body:
        'This is more common than most people think at this stage. Right now, your foundation needs reinforcement before growth becomes the focus. Let’s pull out the blueprints and strengthen the base first.',
      tone: 'border-red-200 bg-red-50 text-red-900',
    };
  }

  if (netWorth < 50000) {
    return {
      title: 'Framing Stage',
      body:
        'You’re at a transition point — what you do next matters most. The structure is forming, but a few key moves will determine how strong it becomes.',
      tone: 'border-amber-200 bg-amber-50 text-amber-900',
    };
  }

  return {
    title: 'Solid Foundation',
    body:
      'You’ve built a solid foundation. Now it’s about strengthening and growing it so it can support the life you want.',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };
}

type InputCardProps = {
  icon: React.ElementType;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
};

function InputCard({ icon: Icon, label, value, onChange }: InputCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Icon className="h-4 w-4 text-copper-600" />
        {label}
      </div>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter an estimate"
        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-900 outline-none focus:border-copper-400 focus:ring-4 focus:ring-copper-100"
      />
    </div>
  );
}

export default function NetWorthActivity({
  initialValues,
  onComplete,
}: NetWorthActivityProps) {
  const [totalLiquidSavings, setTotalLiquidSavings] = useState(String(initialValues?.totalLiquidSavings ?? ''));
  const [totalInvestments, setTotalInvestments] = useState(String(initialValues?.totalInvestments ?? ''));
  const [homeValue, setHomeValue] = useState(String(initialValues?.homeValue ?? ''));
  const [mortgageBalance, setMortgageBalance] = useState(String(initialValues?.mortgageBalance ?? ''));
  const [totalDebtBalance, setTotalDebtBalance] = useState(String(initialValues?.totalDebtBalance ?? ''));

  const totals = useMemo(() => {
    const assets =
      toNumber(totalLiquidSavings) +
      toNumber(totalInvestments) +
      toNumber(homeValue);

    const liabilities =
      toNumber(mortgageBalance) +
      toNumber(totalDebtBalance);

    const netWorth = assets - liabilities;
    return { assets, liabilities, netWorth };
  }, [totalLiquidSavings, totalInvestments, homeValue, mortgageBalance, totalDebtBalance]);

  const message = getNetWorthMessage(totals.netWorth);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-copper-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
        <Calculator className="h-4 w-4" />
        Net Worth Builder
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-navy-900">
        Let’s put your full financial picture together
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        Net worth is simply what you own minus what you owe. We pre-fill the numbers you’ve already entered,
        and you can adjust anything that needs a better estimate.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Assets</div>
          <div className="space-y-3">
            <InputCard icon={PiggyBank} label="Savings" value={totalLiquidSavings} onChange={setTotalLiquidSavings} />
            <InputCard icon={TrendingUp} label="Investments" value={totalInvestments} onChange={setTotalInvestments} />
            <InputCard icon={Home} label="Home Value" value={homeValue} onChange={setHomeValue} />
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Liabilities</div>
          <div className="space-y-3">
            <InputCard icon={Home} label="Mortgage Balance" value={mortgageBalance} onChange={setMortgageBalance} />
            <InputCard icon={CreditCard} label="Other Debt" value={totalDebtBalance} onChange={setTotalDebtBalance} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Total Assets</div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{formatCurrency(totals.assets)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Total Liabilities</div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{formatCurrency(totals.liabilities)}</div>
        </div>
        <div className="rounded-2xl border border-copper-200 bg-copper-50 p-4">
          <div className="text-sm text-slate-500">Estimated Net Worth</div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{formatCurrency(totals.netWorth)}</div>
        </div>
      </div>

      <div className={`mt-6 rounded-2xl border p-5 ${message.tone}`}>
        <div className="text-lg font-bold">{message.title}</div>
        <p className="mt-2 leading-7">{message.body}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Every major insight should use real numbers, explain what they mean, and point to a clear next step.
        </p>

        <button
          type="button"
          onClick={() => onComplete?.(totals)}
          className="inline-flex items-center gap-2 rounded-2xl bg-copper-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-copper-700"
        >
          Use This Net Worth
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
