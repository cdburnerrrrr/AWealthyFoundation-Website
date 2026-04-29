import React, { useMemo } from 'react';
import { Car, ArrowRight, TrendingUp, Wallet, Sparkles, Target, ShieldCheck } from 'lucide-react';

type CarPaymentActivityPayload = {
  carPaymentOpportunityReview: 'reviewed';
  carPaymentMonthlyPayment: number;
  carPaymentAnnualCost: number;
  carPaymentFiveYearCost: number;
  carPaymentMonthlyRaise: number;
  carPaymentMonthlyInvestment: number;
  carPaymentFutureValue: number;
  carPaymentReducedRedirect: number;
  carPaymentReducedFutureValue: number;
  carLoanBalance?: number;
};

type CarPaymentActivityProps = {
  monthlyVehiclePayment: number;
  carLoanBalance?: number;
  years?: number;
  annualReturn?: number;
  onContinue?: (payload: CarPaymentActivityPayload) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function futureValue(monthlyContribution: number, annualReturn = 0.1, years = 30) {
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  if (monthlyContribution <= 0) return 0;
  if (monthlyRate <= 0) return monthlyContribution * months;
  return monthlyContribution * (((1 + monthlyRate) ** months - 1) / monthlyRate);
}

export default function CarPaymentActivity({
  monthlyVehiclePayment,
  carLoanBalance = 0,
  years = 30,
  annualReturn = 0.1,
  onContinue,
}: CarPaymentActivityProps) {
  const safePayment = Math.max(0, Number(monthlyVehiclePayment) || 0);
  const safeBalance = Math.max(0, Number(carLoanBalance) || 0);
  const monthlyRaise = Math.round(safePayment / 2);
  const monthlyInvestment = Math.max(0, safePayment - monthlyRaise);
  const reducedRedirect = Math.max(100, Math.round(safePayment / 5));
  const annualCost = safePayment * 12;
  const fiveYearCost = safePayment * 60;

  const futureValueEstimate = useMemo(
    () => futureValue(monthlyInvestment, annualReturn, years),
    [monthlyInvestment, annualReturn, years]
  );

  const reducedExample = useMemo(
    () => futureValue(reducedRedirect, annualReturn, years),
    [reducedRedirect, annualReturn, years]
  );

  const handleContinue = () => {
    onContinue?.({
      carPaymentOpportunityReview: 'reviewed',
      carPaymentMonthlyPayment: safePayment,
      carPaymentAnnualCost: annualCost,
      carPaymentFiveYearCost: fiveYearCost,
      carPaymentMonthlyRaise: monthlyRaise,
      carPaymentMonthlyInvestment: monthlyInvestment,
      carPaymentFutureValue: Math.round(futureValueEstimate),
      carPaymentReducedRedirect: reducedRedirect,
      carPaymentReducedFutureValue: Math.round(reducedExample),
      carLoanBalance: safeBalance || undefined,
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-copper-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
        <Sparkles className="h-4 w-4" />
        Car Payment Reality Check
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-navy-900">
        Your car payment is part of your financial foundation
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        You reported a vehicle payment of{' '}
        <span className="font-semibold text-navy-900">{formatCurrency(safePayment)}/month</span>
        {safeBalance > 0 ? (
          <>
            {' '}with an estimated loan balance of{' '}
            <span className="font-semibold text-navy-900">{formatCurrency(safeBalance)}</span>.
          </>
        ) : null}{' '}
        The point is not to shame the payment. It is to show how much monthly breathing room this one decision can control over time.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Car className="h-4 w-4 text-copper-600" />
            Current Payment
          </div>
          <div className="text-2xl font-bold text-navy-900">{formatCurrency(safePayment)}</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            That is about {formatCurrency(annualCost)} per year already committed before other goals get funded.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <Wallet className="h-4 w-4" />
            Future Breathing Room
          </div>
          <div className="text-2xl font-bold text-navy-900">{formatCurrency(monthlyRaise)}</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Once the payment is gone, half of it could go back into monthly cash flow as an instant raise.
          </p>
        </div>

        <div className="rounded-2xl border border-copper-200 bg-copper-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-copper-800">
            <TrendingUp className="h-4 w-4" />
            Long-Term Opportunity
          </div>
          <div className="text-2xl font-bold text-navy-900">{formatCurrency(futureValueEstimate)}</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            If the other half were invested monthly for {years} years at about {Math.round(annualReturn * 100)}% annual growth.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2 text-lg font-bold text-navy-900">
            <Target className="h-5 w-5 text-copper-600" />
            What this changes
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            A car payment can look affordable because it fits into the month. But over five years, this payment represents roughly{' '}
            <span className="font-semibold text-navy-900">{formatCurrency(fiveYearCost)}</span> of cash flow. That is money that could also build a starter emergency fund, reduce debt, or create margin for a family budget.
          </p>
        </div>

        <div className="rounded-2xl border border-copper-200 bg-copper-50 p-5">
          <div className="flex items-center gap-2 text-lg font-bold text-navy-900">
            <ShieldCheck className="h-5 w-5 text-copper-700" />
            Blueprint takeaway
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            The goal is not necessarily to sell the vehicle tomorrow. The goal is to stop rolling one payment into the next. When this loan is gone, treat the freed-up payment like a tool: keep part for breathing room and send part toward debt, savings, or investing.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-lg font-bold text-navy-900">How to actually use this</div>
        <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-copper-600" />
            <span>Keep the current vehicle longer after it is paid off instead of immediately replacing the payment.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-copper-600" />
            <span>When the payment disappears, split it: use about {formatCurrency(monthlyRaise)} for breathing room and about {formatCurrency(monthlyInvestment)} for debt payoff, savings, or investing.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-copper-600" />
            <span>Even redirecting {formatCurrency(reducedRedirect)} per month could grow to roughly {formatCurrency(reducedExample)} over {years} years.</span>
          </li>
        </ul>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-2 rounded-2xl bg-copper-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-copper-700"
        >
          Add This Insight To My Report
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
