import React, { useMemo, useState } from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';

type Shift = 'aligned' | 'overestimated' | 'underestimated';

type IncomeProtectionActivityProps = {
  responses: Record<string, any>;
  onContinue: (payload?: Record<string, any>) => void;
};

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

function formatMonths(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0 months';
  if (value < 1) return `${value.toFixed(1)} months`;
  return `${value.toFixed(value < 10 ? 1 : 0)} months`;
}

function getDebtPayments(responses: Record<string, any>) {
  const itemized =
    toNumber(responses.monthlyVehiclePayment) +
    toNumber(responses.creditCardPayment) +
    toNumber(responses.studentLoanPayment) +
    toNumber(responses.personalLoanPayment) +
    toNumber(responses.bnplPayment) +
    toNumber(responses.paydayPayment) +
    toNumber(responses.medicalDebtPayment);

  const legacy = toNumber(responses.monthlyDebtPayments) || toNumber(responses.monthlyConsumerDebtPayments);
  return itemized > 0 ? itemized : legacy;
}

function getProtectionLabel(value?: string) {
  const map: Record<string, string> = {
    well_protected: 'well protected',
    somewhat_protected: 'somewhat protected',
    not_protected: 'not protected',
  };
  return value ? map[value] || value.replace(/_/g, ' ') : 'unsure';
}

function getCoverageTier(months: number, hasDisability: boolean, singleIncomeRisk: boolean) {
  if (months >= 6 && (hasDisability || !singleIncomeRisk)) {
    return {
      badge: 'Strong backup',
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-950',
      icon: <ShieldCheck className="h-5 w-5" />,
      headline: 'Your income backup looks strong',
      body: 'Your current emergency savings and protection signals suggest you have meaningful time to respond if income is interrupted.',
    };
  }

  if (months >= 3 || hasDisability) {
    return {
      badge: 'Decent backup',
      tone: 'border-amber-200 bg-amber-50 text-amber-950',
      icon: <ShieldCheck className="h-5 w-5" />,
      headline: 'You have some protection, but there is room to strengthen it',
      body: 'Your numbers show some backup. The next step is making sure savings, disability coverage, and household income risk are working together.',
    };
  }

  return {
    badge: 'Risky backup',
    tone: 'border-red-200 bg-red-50 text-red-950',
    icon: <AlertTriangle className="h-5 w-5" />,
    headline: 'Your income has very little backup right now',
    body: 'If income stopped, your current emergency fund would not cover much time before the rest of the plan came under pressure.',
  };
}

export default function IncomeProtectionActivity({ responses, onContinue }: IncomeProtectionActivityProps) {
  const [shift, setShift] = useState<Shift | null>(null);

  const data = useMemo(() => {
    const savings = toNumber(responses.totalLiquidSavings) || toNumber(responses.cashSavings);
    const housing = toNumber(responses.monthlyHousingCost);
    const utilities = toNumber(responses.monthlyUtilities);
    const childcare = toNumber(responses.monthlyChildcareCost);
    const debtPayments = getDebtPayments(responses);
    const essentialMonthlyCosts = housing + utilities + childcare + debtPayments;
    const coverageMonths = essentialMonthlyCosts > 0 ? savings / essentialMonthlyCosts : 0;
    const coverage = responses.protectionCoverage ?? [];
    const hasDisability =
      Array.isArray(coverage) && coverage.includes('disability') ||
      responses.hasDisabilityInsurance === 'yes' ||
      responses.incomeInterruptionCoverage === 'very_prepared';
    const household = responses.relationshipStatus;
    const singleIncomeRisk = household === 'single' || household === 'single_with_dependents' || responses.dualIncomeHousehold === 'no';
    const tier = getCoverageTier(coverageMonths, hasDisability, singleIncomeRisk);

    return {
      savings,
      housing,
      utilities,
      childcare,
      debtPayments,
      essentialMonthlyCosts,
      coverageMonths,
      hasDisability,
      singleIncomeRisk,
      tier,
    };
  }, [responses]);

  const save = (selectedShift: Shift) => {
    setShift(selectedShift);
    onContinue({
      incomeProtectionRealityCheck: 'reviewed',
      incomeProtectionShift: selectedShift,
      incomeProtectionCalculatedMonths: Number(data.coverageMonths.toFixed(2)),
      incomeProtectionEssentialMonthlyCosts: Math.round(data.essentialMonthlyCosts),
      incomeProtectionSavingsUsed: Math.round(data.savings),
      incomeProtectionSingleIncomeRisk: data.singleIncomeRisk,
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-copper-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
        <Wallet className="h-4 w-4" />
        Income Protection Reality Check
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-navy-900">
        If income stopped, your savings covers about {formatMonths(data.coverageMonths)}
      </h2>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        Earlier, you said you felt <span className="font-semibold text-slate-900">{getProtectionLabel(responses.incomeProtectionLevel)}</span>. Now let’s compare that feeling to the numbers you already entered.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Emergency savings</div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{formatCurrency(data.savings)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Must-pay monthly bills</div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{formatCurrency(data.essentialMonthlyCosts)}</div>
        </div>
        <div className="rounded-2xl border border-copper-200 bg-copper-50 p-4">
          <div className="text-sm text-slate-600">Coverage</div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{formatMonths(data.coverageMonths)}</div>
        </div>
      </div>

      <div className={`mt-6 rounded-2xl border p-5 ${data.tier.tone}`}>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wide">
          {data.tier.icon}
          {data.tier.badge}
        </div>
        <h3 className="mt-4 text-xl font-bold">{data.tier.headline}</h3>
        <p className="mt-2 leading-7">{data.tier.body}</p>
        {data.singleIncomeRisk && (
          <p className="mt-3 leading-7">
            Your work income is the engine that drives most households. When there is only one primary income source, protection usually means disability insurance plus enough emergency reserves to cover basic expenses while you get back on your feet.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-lg font-bold text-navy-900">Does this still feel accurate?</div>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          This helps your report capture whether your original feeling matched the numbers, or whether this created an important aha moment.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button type="button" onClick={() => save('aligned')} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm font-semibold text-slate-800 transition hover:border-copper-300 hover:bg-copper-50">
            <CheckCircle2 className="mb-2 h-5 w-5 text-copper-600" />
            Yes, that feels right
          </button>
          <button type="button" onClick={() => save('overestimated')} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm font-semibold text-slate-800 transition hover:border-copper-300 hover:bg-copper-50">
            <AlertTriangle className="mb-2 h-5 w-5 text-copper-600" />
            I feel less protected now
          </button>
          <button type="button" onClick={() => save('underestimated')} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm font-semibold text-slate-800 transition hover:border-copper-300 hover:bg-copper-50">
            <ShieldCheck className="mb-2 h-5 w-5 text-copper-600" />
            I feel more protected than this shows
          </button>
        </div>
      </div>

      {shift && (
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={() => onContinue()} className="inline-flex items-center gap-2 rounded-2xl bg-copper-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-copper-700">
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
