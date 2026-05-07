import React, { useMemo, useState } from 'react';
import { Calculator, Home, PiggyBank, TrendingUp, CreditCard, ArrowRight, Landmark } from 'lucide-react';

type NetWorthInputs = {
  totalLiquidSavings?: number;
  totalInvestments?: number;
  homeValue?: number;
  mortgageBalance?: number;
  totalDebtBalance?: number;
  otherAssets?: number;
  rentalPropertyValue?: number;
  rentalMortgage?: number;
  otherPropertyValue?: number;
  otherPropertyDebt?: number;
  propertyOwnership?: string[] | string;
  housingStatus?: string;
};

type NetWorthActivityProps = {
  initialValues?: NetWorthInputs;
  onComplete?: (payload: {
    netWorth: number;
    assets: number;
    liabilities: number;
    totalLiquidSavings: number;
    totalInvestments: number;
    homeValue: number;
    mortgageBalance: number;
    totalDebtBalance: number;
    otherAssets: number;
    rentalPropertyValue: number;
    rentalMortgage: number;
    otherPropertyValue: number;
    otherPropertyDebt: number;
  }) => void;
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
      title: 'Foundation Under Pressure',
      body:
        'Right now, you owe more than you own. This is common at this stage, especially when debt and limited savings are competing for the same dollars. The priority is not growth — it is reducing pressure and creating breathing room so progress becomes possible.',
      tone: 'border-red-200 bg-red-50 text-red-900',
    };
  }

  if (netWorth < 50000) {
    return {
      title: 'Framing Stage',
      body:
        'Your foundation is forming. The next move is to keep assets growing while reducing the debts or fixed costs that could pull the number backward.',
      tone: 'border-amber-200 bg-amber-50 text-amber-900',
    };
  }

  return {
    title: 'Solid Foundation',
    body:
      'You have built a positive base. Now the work is strengthening the parts that help this number grow: savings, investing, equity, and lower debt pressure.',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };
}

type InputCardProps = {
  icon: React.ElementType;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  tone?: 'asset' | 'liability';
};

function InputCard({ icon: Icon, label, value, onChange, tone = 'asset' }: InputCardProps) {
  const toneClass =
    tone === 'liability'
      ? 'border-red-200 bg-red-50/40 focus-within:border-red-300 focus-within:ring-red-100'
      : 'border-emerald-200 bg-emerald-50/40 focus-within:border-emerald-300 focus-within:ring-emerald-100';
  const iconClass = tone === 'liability' ? 'text-red-600' : 'text-emerald-600';

  return (
    <div className={`rounded-2xl border p-4 transition focus-within:ring-4 ${toneClass}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        {label}
      </div>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter an estimate"
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none focus:border-copper-400 focus:ring-4 focus:ring-copper-100"
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
  const [rentalPropertyValue, setRentalPropertyValue] = useState(String(initialValues?.rentalPropertyValue ?? ''));
  const [rentalMortgage, setRentalMortgage] = useState(String(initialValues?.rentalMortgage ?? ''));
  const [otherPropertyValue, setOtherPropertyValue] = useState(String(initialValues?.otherPropertyValue ?? ''));
  const [otherPropertyDebt, setOtherPropertyDebt] = useState(String(initialValues?.otherPropertyDebt ?? ''));
  const [otherAssets, setOtherAssets] = useState(String(initialValues?.otherAssets ?? ''));
  const [totalDebtBalance, setTotalDebtBalance] = useState(String(initialValues?.totalDebtBalance ?? ''));

  const propertyOwnership = Array.isArray(initialValues?.propertyOwnership)
    ? initialValues.propertyOwnership
    : initialValues?.propertyOwnership
      ? [String(initialValues.propertyOwnership)]
      : [];

  const ownsPrimaryHome =
    propertyOwnership.includes('primary_home') ||
    initialValues?.housingStatus === 'own_with_mortgage' ||
    initialValues?.housingStatus === 'own_outright' ||
    toNumber(initialValues?.homeValue) > 0 ||
    toNumber(initialValues?.mortgageBalance) > 0;
  const ownsRentalProperty =
    propertyOwnership.includes('rental_property') ||
    toNumber(initialValues?.rentalPropertyValue) > 0 ||
    toNumber(initialValues?.rentalMortgage) > 0;
  const ownsOtherProperty =
    propertyOwnership.includes('other_property') ||
    toNumber(initialValues?.otherPropertyValue) > 0 ||
    toNumber(initialValues?.otherPropertyDebt) > 0;

  const totals = useMemo(() => {
    const assets =
      toNumber(totalLiquidSavings) +
      toNumber(totalInvestments) +
      toNumber(homeValue) +
      toNumber(rentalPropertyValue) +
      toNumber(otherPropertyValue) +
      toNumber(otherAssets);

    const liabilities =
      toNumber(mortgageBalance) +
      toNumber(rentalMortgage) +
      toNumber(otherPropertyDebt) +
      toNumber(totalDebtBalance);

    const netWorth = assets - liabilities;
    return { assets, liabilities, netWorth };
  }, [
    totalLiquidSavings,
    totalInvestments,
    homeValue,
    mortgageBalance,
    rentalPropertyValue,
    rentalMortgage,
    otherPropertyValue,
    otherPropertyDebt,
    otherAssets,
    totalDebtBalance,
  ]);

  const message = getNetWorthMessage(totals.netWorth);
  const netWorthPositive = totals.netWorth >= 0;

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
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/25 p-4">
          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Assets</div>
          <div className="space-y-3">
            <InputCard tone="asset" icon={PiggyBank} label="Savings" value={totalLiquidSavings} onChange={setTotalLiquidSavings} />
            <InputCard tone="asset" icon={TrendingUp} label="Investments" value={totalInvestments} onChange={setTotalInvestments} />
            {ownsPrimaryHome && (
              <InputCard tone="asset" icon={Home} label="Primary Home Value" value={homeValue} onChange={setHomeValue} />
            )}
            {ownsRentalProperty && (
              <InputCard tone="asset" icon={Landmark} label="Rental Property Value" value={rentalPropertyValue} onChange={setRentalPropertyValue} />
            )}
            {ownsOtherProperty && (
              <InputCard tone="asset" icon={Landmark} label="Other Property Value" value={otherPropertyValue} onChange={setOtherPropertyValue} />
            )}
            <InputCard tone="asset" icon={PiggyBank} label="Crypto, Single Stocks & Other Assets" value={otherAssets} onChange={setOtherAssets} />
          </div>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50/25 p-4">
          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-red-700">Liabilities</div>
          <div className="space-y-3">
            {ownsPrimaryHome && (
              <InputCard tone="liability" icon={Home} label="Primary Mortgage Balance" value={mortgageBalance} onChange={setMortgageBalance} />
            )}
            {ownsRentalProperty && (
              <InputCard tone="liability" icon={Landmark} label="Rental Mortgage Balance" value={rentalMortgage} onChange={setRentalMortgage} />
            )}
            {ownsOtherProperty && (
              <InputCard tone="liability" icon={Landmark} label="Other Property Mortgage or Debt" value={otherPropertyDebt} onChange={setOtherPropertyDebt} />
            )}
            <InputCard tone="liability" icon={CreditCard} label="Total Consumer Debt (cards, loans, medical)" value={totalDebtBalance} onChange={setTotalDebtBalance} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-sm text-emerald-700">Total Assets</div>
          <div className="mt-2 text-2xl font-bold text-emerald-800">{formatCurrency(totals.assets)}</div>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="text-sm text-red-700">Total Liabilities</div>
          <div className="mt-2 text-2xl font-bold text-red-800">{formatCurrency(totals.liabilities)}</div>
        </div>
        <div className={`rounded-2xl border p-4 ${netWorthPositive ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <div className={`text-sm ${netWorthPositive ? 'text-emerald-700' : 'text-red-700'}`}>Estimated Net Worth</div>
          <div className={`mt-2 text-2xl font-bold ${netWorthPositive ? 'text-emerald-800' : 'text-red-800'}`}>{formatCurrency(totals.netWorth)}</div>
        </div>
      </div>

      <div className={`mt-6 rounded-2xl border p-5 ${message.tone}`}>
        <div className="text-lg font-bold">{message.title}</div>
        <p className="mt-2 leading-7">{message.body}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm leading-6 text-slate-500">
          Net worth shows whether your financial life is moving forward or backward. Only include crypto, single stocks, or other assets here if they were not already included in your investment accounts above.
        </p>

        <button
          type="button"
          onClick={() => onComplete?.({
            ...totals,
            totalLiquidSavings: toNumber(totalLiquidSavings),
            totalInvestments: toNumber(totalInvestments),
            homeValue: toNumber(homeValue),
            mortgageBalance: toNumber(mortgageBalance),
            totalDebtBalance: toNumber(totalDebtBalance),
            otherAssets: toNumber(otherAssets),
            rentalPropertyValue: toNumber(rentalPropertyValue),
            rentalMortgage: toNumber(rentalMortgage),
            otherPropertyValue: toNumber(otherPropertyValue),
            otherPropertyDebt: toNumber(otherPropertyDebt),
          })}
          className="inline-flex items-center gap-2 rounded-2xl bg-copper-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-copper-700"
        >
          Use This Net Worth
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
