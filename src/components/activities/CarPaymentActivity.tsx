import React, { useMemo } from 'react';
import { Car, ArrowRight, TrendingUp, Wallet, Sparkles } from 'lucide-react';

type CarPaymentActivityProps = {
  monthlyVehiclePayment: number;
  years?: number;
  annualReturn?: number;
  onContinue?: () => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function futureValue(monthlyContribution: number, annualReturn = 0.1, years = 30) {
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  if (monthlyContribution <= 0) return 0;
  return monthlyContribution * (((1 + monthlyRate) ** months - 1) / monthlyRate);
}

export default function CarPaymentActivity({
  monthlyVehiclePayment,
  years = 30,
  annualReturn = 0.1,
  onContinue,
}: CarPaymentActivityProps) {
  const monthlyRaise = monthlyVehiclePayment / 2;
  const monthlyInvestment = monthlyVehiclePayment / 2;

  const futureValueEstimate = useMemo(
    () => futureValue(monthlyInvestment, annualReturn, years),
    [monthlyInvestment, annualReturn, years]
  );

  const reducedExample = useMemo(
    () => futureValue(Math.max(100, Math.round(monthlyVehiclePayment / 5)), annualReturn, years),
    [monthlyVehiclePayment, annualReturn, years]
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-copper-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
        <Sparkles className="h-4 w-4" />
        Car Payment Reality Check
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-navy-900">
        What your car payment may be costing your future
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        You’re currently paying <span className="font-semibold text-navy-900">{formatCurrency(monthlyVehiclePayment)}/month</span> toward your vehicle.
        The long-term opportunity is not just “invest more.” It is to eventually buy a less expensive car with cash, remove the payment,
        give yourself an instant raise, and invest part of what used to leave your account every month.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Car className="h-4 w-4 text-copper-600" />
            Current Payment
          </div>
          <div className="text-2xl font-bold text-navy-900">{formatCurrency(monthlyVehiclePayment)}</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This is the monthly drag already built into your budget.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <Wallet className="h-4 w-4" />
            Instant Raise
          </div>
          <div className="text-2xl font-bold text-navy-900">{formatCurrency(monthlyRaise)}</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Half goes right back into your monthly cash flow once the payment is gone.
          </p>
        </div>

        <div className="rounded-2xl border border-copper-200 bg-copper-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-copper-800">
            <TrendingUp className="h-4 w-4" />
            Future Value
          </div>
          <div className="text-2xl font-bold text-navy-900">{formatCurrency(futureValueEstimate)}</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            If the other half were invested monthly for {years} years at about {Math.round(annualReturn * 100)}% annual growth.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-lg font-bold text-navy-900">How to actually do this</div>
        <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-copper-600" />
            <span>Keep driving paid-off cars longer and save ahead for the next one instead of rolling one payment into the next.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-copper-600" />
            <span>Once the payment disappears, split it: use half as an instant raise in your monthly budget and invest the other half automatically.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-copper-600" />
            <span>Even trimming this payment by a smaller amount can matter. Redirecting about {formatCurrency(Math.max(100, Math.round(monthlyVehiclePayment / 5)))} per month could still grow to roughly {formatCurrency(reducedExample)} over {years} years.</span>
          </li>
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-copper-200 bg-copper-50 p-5">
        <div className="text-lg font-bold text-navy-900">Blueprint takeaway</div>
        <p className="mt-2 leading-7 text-slate-700">
          A car payment may feel affordable because it fits in the month, but it can quietly cost hundreds of thousands of dollars in future flexibility and compounding. That is exactly the kind of hidden pressure this assessment is designed to uncover.
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-2xl bg-copper-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-copper-700"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
