export type RedirectMode = 'full' | 'half' | 'custom';

export type CarPaymentOpportunityInputs = {
  monthlyPayment: number;
  monthsLeft: number;
  interestRateApr: number;
  payoffBalance: number;
  estimatedCarValue: number;
  currentAge: number;
  retirementAge: number;
  expectedAnnualReturn: number;
  redirectMode: RedirectMode;
  customRedirectAmount: number;
};

export type FutureValueResult = {
  monthlyAmount: number;
  futureValue: number;
  totalContributions: number;
  growthEarned: number;
};

export type EquityStatus = {
  hasValues: boolean;
  equity: number;
  label: string;
  body: string;
  tone: 'positive' | 'underwater' | 'neutral';
};

export type CarPaymentOpportunityResult = {
  totalRemainingPayments: number;
  estimatedInterestPaid: number;
  estimatedPayoffBalance: number;
  monthsCommitted: number;
  yearsCommittedLabel: string;
  monthsToRetirement: number;
  selectedRedirectAmount: number;
  selectedScenarioLabel: string;
  selectedFuture: FutureValueResult;
  fullFuture: FutureValueResult;
  halfFuture: FutureValueResult;
  equityStatus: EquityStatus;
  headline: string;
  insight: string;
};

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function roundCurrency(value: number) {
  return Math.round(Number.isFinite(value) ? value : 0);
}

function calculateRemainingLoanBalance(monthlyPayment: number, monthsLeft: number, interestRateApr: number) {
  const payment = Math.max(0, safeNumber(monthlyPayment));
  const months = Math.max(0, Math.round(safeNumber(monthsLeft)));
  const apr = clamp(interestRateApr, 0, 100);

  if (payment <= 0 || months <= 0) return 0;
  if (apr <= 0) return payment * months;

  const monthlyRate = apr / 100 / 12;
  return payment * ((1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate);
}

function calculateFutureValue(monthlyAmount: number, months: number, annualReturn: number): FutureValueResult {
  const amount = Math.max(0, safeNumber(monthlyAmount));
  const contributionMonths = Math.max(0, Math.round(safeNumber(months)));
  const annualRate = clamp(annualReturn, 0, 50) / 100;
  const totalContributions = amount * contributionMonths;

  if (amount <= 0 || contributionMonths <= 0) {
    return {
      monthlyAmount: roundCurrency(amount),
      futureValue: 0,
      totalContributions: 0,
      growthEarned: 0,
    };
  }

  if (annualRate <= 0) {
    return {
      monthlyAmount: roundCurrency(amount),
      futureValue: roundCurrency(totalContributions),
      totalContributions: roundCurrency(totalContributions),
      growthEarned: 0,
    };
  }

  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  const futureValue = amount * ((Math.pow(1 + monthlyRate, contributionMonths) - 1) / monthlyRate);

  return {
    monthlyAmount: roundCurrency(amount),
    futureValue: roundCurrency(futureValue),
    totalContributions: roundCurrency(totalContributions),
    growthEarned: roundCurrency(futureValue - totalContributions),
  };
}

function getYearsCommittedLabel(monthsCommitted: number) {
  if (monthsCommitted <= 0) return 'No remaining payment timeline entered';
  const years = monthsCommitted / 12;
  if (monthsCommitted < 12) return `${monthsCommitted} month${monthsCommitted === 1 ? '' : 's'}`;
  return `${years.toFixed(years % 1 === 0 ? 0 : 1)} years`;
}

function getEquityStatus(payoffBalance: number, estimatedCarValue: number): EquityStatus {
  const payoff = Math.max(0, safeNumber(payoffBalance));
  const value = Math.max(0, safeNumber(estimatedCarValue));

  if (payoff <= 0 || value <= 0) {
    return {
      hasValues: false,
      equity: 0,
      label: 'Equity not calculated',
      body: 'Enter both payoff balance and estimated car value to see whether the vehicle has equity or is underwater.',
      tone: 'neutral',
    };
  }

  const equity = value - payoff;

  if (equity < 0) {
    return {
      hasValues: true,
      equity: roundCurrency(equity),
      label: 'Underwater',
      body: `The payoff balance is about ${formatCarPaymentCurrency(Math.abs(equity))} higher than the estimated value.`,
      tone: 'underwater',
    };
  }

  return {
    hasValues: true,
    equity: roundCurrency(equity),
    label: equity > 0 ? 'Positive equity' : 'Break-even',
    body:
      equity > 0
        ? `The estimated value is about ${formatCarPaymentCurrency(equity)} higher than the payoff balance.`
        : 'The payoff balance and estimated value are about the same.',
    tone: equity > 0 ? 'positive' : 'neutral',
  };
}

function getSelectedRedirectAmount(input: CarPaymentOpportunityInputs) {
  const payment = Math.max(0, safeNumber(input.monthlyPayment));

  if (input.redirectMode === 'half') return payment / 2;
  if (input.redirectMode === 'custom') return Math.max(0, safeNumber(input.customRedirectAmount));
  return payment;
}

function getSelectedScenarioLabel(input: CarPaymentOpportunityInputs) {
  if (input.redirectMode === 'half') return 'Half payment redirected';
  if (input.redirectMode === 'custom') return 'Custom amount redirected';
  return 'Full payment redirected';
}

export function calculateCarPaymentOpportunity(input: CarPaymentOpportunityInputs): CarPaymentOpportunityResult {
  const monthlyPayment = Math.max(0, safeNumber(input.monthlyPayment));
  const monthsLeft = Math.max(0, Math.round(safeNumber(input.monthsLeft)));
  const interestRateApr = clamp(input.interestRateApr, 0, 100);
  const payoffBalance = Math.max(0, safeNumber(input.payoffBalance));
  const estimatedCarValue = Math.max(0, safeNumber(input.estimatedCarValue));
  const currentAge = clamp(input.currentAge, 0, 100);
  const retirementAge = clamp(input.retirementAge, currentAge, 100);
  const expectedAnnualReturn = clamp(input.expectedAnnualReturn, 0, 50);

  const totalRemainingPayments = monthlyPayment * monthsLeft;
  const estimatedPayoffBalance = payoffBalance > 0
    ? payoffBalance
    : calculateRemainingLoanBalance(monthlyPayment, monthsLeft, interestRateApr);
  const estimatedInterestPaid = Math.max(0, totalRemainingPayments - estimatedPayoffBalance);
  const monthsToRetirement = Math.max(0, Math.round((retirementAge - currentAge) * 12));
  const selectedRedirectAmount = getSelectedRedirectAmount(input);

  const fullFuture = calculateFutureValue(monthlyPayment, monthsToRetirement, expectedAnnualReturn);
  const halfFuture = calculateFutureValue(monthlyPayment / 2, monthsToRetirement, expectedAnnualReturn);
  const selectedFuture = calculateFutureValue(selectedRedirectAmount, monthsToRetirement, expectedAnnualReturn);

  const headline = selectedFuture.futureValue > 0
    ? `Your payment could become ${formatCarPaymentCurrency(selectedFuture.futureValue)}`
    : 'Enter your payment to see what it could become';

  const insight = selectedFuture.futureValue > 0
    ? `${formatCarPaymentCurrency(selectedFuture.totalContributions)} would come from your redirected payments. The other ${formatCarPaymentCurrency(selectedFuture.growthEarned)} is projected growth.`
    : 'This shows how one old obligation can become future margin, investing, or freedom.';

  return {
    totalRemainingPayments: roundCurrency(totalRemainingPayments),
    estimatedInterestPaid: roundCurrency(estimatedInterestPaid),
    estimatedPayoffBalance: roundCurrency(estimatedPayoffBalance),
    monthsCommitted: monthsLeft,
    yearsCommittedLabel: getYearsCommittedLabel(monthsLeft),
    monthsToRetirement,
    selectedRedirectAmount: roundCurrency(selectedRedirectAmount),
    selectedScenarioLabel: getSelectedScenarioLabel(input),
    selectedFuture,
    fullFuture,
    halfFuture,
    equityStatus: getEquityStatus(payoffBalance, estimatedCarValue),
    headline,
    insight,
  };
}

export function formatCarPaymentCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(roundCurrency(value));
}

export function formatCarPaymentNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(roundCurrency(value));
}
