import React from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2, Car, DollarSign, ShieldCheck } from 'lucide-react';

type CarPaymentActivityProps = {
  monthlyVehiclePayment: number;
  carLoanBalance?: number;
  vehicleValue?: number;
  monthlyIncome?: number;
  onContinue: (payload?: Record<string, any>) => void;
};

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

function formatPercent(value: number) {
  return `${Math.round(Number.isFinite(value) ? value : 0)}%`;
}

function getVehicleDecision(input: {
  monthlyVehiclePayment: number;
  carLoanBalance: number;
  vehicleValue: number;
  monthlyIncome: number;
}) {
  const { monthlyVehiclePayment, carLoanBalance, vehicleValue, monthlyIncome } = input;
  const annualPayment = monthlyVehiclePayment * 12;
  const fiveYearCost = monthlyVehiclePayment * 60;
  const paymentRatio = monthlyIncome > 0 ? (monthlyVehiclePayment / monthlyIncome) * 100 : 0;
  const vehicleEquity = vehicleValue > 0 ? vehicleValue - carLoanBalance : 0;
  const underwaterAmount = vehicleValue > 0 ? Math.max(0, carLoanBalance - vehicleValue) : 0;
  const estimatedPayoffMonths =
    monthlyVehiclePayment > 0 && carLoanBalance > 0
      ? Math.ceil(carLoanBalance / monthlyVehiclePayment)
      : 0;
  const estimatedPayoffYears = estimatedPayoffMonths > 0 ? Math.max(1, Math.round(estimatedPayoffMonths / 12)) : 0;

  if (underwaterAmount > 0) {
    return {
      tone: 'border-red-200 bg-red-50 text-red-950',
      badge: 'Limited flexibility',
      headline: `You may owe ${formatCurrency(underwaterAmount)} more than the car is worth`,
      body:
        'Because the loan exceeds the vehicle’s value, selling or trading it may not fully eliminate the debt. This does not mean you are stuck, but it does mean you should compare the real cost of each option before acting.',
      bestMove:
        `Check your payoff amount and vehicle value first. Then ask a local credit union what a smaller loan for the ${formatCurrency(underwaterAmount)} gap could look like. A smaller gap loan may create more breathing room than staying in a ${formatCurrency(carLoanBalance)} car loan with a ${formatCurrency(monthlyVehiclePayment)} payment${estimatedPayoffYears ? ` for roughly ${estimatedPayoffYears} more year${estimatedPayoffYears === 1 ? '' : 's'}` : ''}, but compare total cost before deciding.`,
      options: [
        'Keep the car and focus extra payments on reducing the upside-down amount.',
        'Explore refinancing only if it lowers pressure without stretching the debt too far.',
        'Compare selling/trading and covering the gap separately, especially through a local credit union.',
      ],
      priority: 'high' as const,
      underwaterAmount,
      vehicleEquity,
      paymentRatio,
      annualPayment,
      fiveYearCost,
      estimatedPayoffMonths,
    };
  }

  if (paymentRatio >= 15) {
    return {
      tone: 'border-amber-200 bg-amber-50 text-amber-950',
      badge: 'High payment pressure',
      headline: `Your car payment is ${formatPercent(paymentRatio)} of take-home pay`,
      body:
        'That is a meaningful fixed obligation. Reducing or eliminating it could be one of the fastest ways to create monthly breathing room.',
      bestMove:
        'Compare refinance, trade-down, private sale, and accelerated payoff options. Judge each option by how much monthly breathing room it actually creates.',
      options: [
        'Refinance if it lowers payment pressure without adding too much time.',
        'Trade down or sell if you have enough equity and still need reliable transportation.',
        'Accelerate payoff if your emergency fund is stable and the payment is the main drag.',
      ],
      priority: 'high' as const,
      underwaterAmount,
      vehicleEquity,
      paymentRatio,
      annualPayment,
      fiveYearCost,
      estimatedPayoffMonths,
    };
  }

  if (paymentRatio >= 10) {
    return {
      tone: 'border-copper-200 bg-copper-50 text-copper-950',
      badge: 'Watch closely',
      headline: `Your car payment is noticeable at ${formatPercent(paymentRatio)} of income`,
      body:
        'This may be manageable, but it is still large enough to watch before upgrading or adding more debt.',
      bestMove:
        'Keep the vehicle plan steady and avoid upgrading until your higher-priority foundation goals are stronger.',
      options: [
        'Avoid taking on a larger payment.',
        'Consider small extra principal payments once your cash cushion is stable.',
        'Review insurance, maintenance, and the payment together as the full vehicle cost.',
      ],
      priority: 'medium' as const,
      underwaterAmount,
      vehicleEquity,
      paymentRatio,
      annualPayment,
      fiveYearCost,
      estimatedPayoffMonths,
    };
  }

  return {
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    badge: 'Manageable',
    headline: 'Your vehicle payment looks manageable',
    body:
      'Based on the numbers entered, the vehicle does not appear to be one of your biggest pressure points right now.',
    bestMove:
      'Maintain the current plan and focus your attention on the area creating the most pressure elsewhere in your foundation.',
    options: [
      'Keep the payment predictable.',
      'Avoid upgrading before the rest of your foundation is stronger.',
      'Direct extra cash toward the higher-priority goal first.',
    ],
    priority: 'low' as const,
    underwaterAmount,
    vehicleEquity,
    paymentRatio,
    annualPayment,
    fiveYearCost,
    estimatedPayoffMonths,
  };
}

export default function CarPaymentActivity({
  monthlyVehiclePayment,
  carLoanBalance = 0,
  vehicleValue = 0,
  monthlyIncome = 0,
  onContinue,
}: CarPaymentActivityProps) {
  const decision = getVehicleDecision({
    monthlyVehiclePayment,
    carLoanBalance,
    vehicleValue,
    monthlyIncome,
  });

  const hasValueData = carLoanBalance > 0 && vehicleValue > 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-copper-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
        <Car className="h-4 w-4" />
        Car Payment Reality Check
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-navy-900">
        Your vehicle payment is {formatCurrency(monthlyVehiclePayment)}/month
      </h2>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        A car payment is not just transportation. It is a fixed obligation that affects monthly breathing room, debt pressure, and how quickly the rest of your foundation can improve.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <DollarSign className="h-4 w-4" /> Monthly payment
          </div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{formatCurrency(monthlyVehiclePayment)}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Annual cost</div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{formatCurrency(decision.annualPayment)}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-500">5-year payment total</div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{formatCurrency(decision.fiveYearCost)}</div>
        </div>
      </div>

      {hasValueData ? (
        <div className={`mt-6 rounded-2xl border p-5 ${decision.tone}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              {decision.priority === 'high' ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              {decision.badge}
            </div>
            <div className="text-sm font-semibold">
              Loan {formatCurrency(carLoanBalance)} • Value {formatCurrency(vehicleValue)}
            </div>
          </div>

          <h3 className="mt-4 text-xl font-bold">{decision.headline}</h3>
          <p className="mt-2 leading-7">{decision.body}</p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
          <h3 className="text-lg font-bold text-navy-900">Equity position not calculated yet</h3>
          <p className="mt-2 leading-7">
            Add an estimated vehicle value in the assessment to see whether the loan is above or below what the car may be worth.
          </p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-copper-200 bg-copper-50 p-5">
        <div className="text-lg font-bold text-navy-900">Best next move</div>
        <p className="mt-2 leading-7 text-slate-700">{decision.bestMove}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-lg font-bold text-navy-900">Options to compare</div>
        <div className="mt-4 space-y-3">
          {decision.options.map((option) => (
            <div key={option} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-copper-600" />
              <span>{option}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() =>
            onContinue({
              carPaymentOpportunityReview: 'reviewed',
              vehicleDecisionPriority: decision.priority,
              vehiclePaymentRatio: decision.paymentRatio,
              vehicleEquity: decision.vehicleEquity,
              vehicleUnderwaterAmount: decision.underwaterAmount,
              estimatedVehiclePayoffMonths: decision.estimatedPayoffMonths,
              carPaymentAnnualCost: decision.annualPayment,
              carPaymentFiveYearCost: decision.fiveYearCost,
            })
          }
          className="inline-flex items-center gap-2 rounded-2xl bg-copper-600 px-5 py-3 text-sm font-bold text-white hover:bg-copper-700 transition"
        >
          Save this insight
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
