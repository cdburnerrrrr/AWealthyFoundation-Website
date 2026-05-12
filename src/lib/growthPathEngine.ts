export type GrowthProjectionInput = {
  startingBalance: number;
  monthlyContribution: number;
  years: number;
  annualReturn: number;
  annualContributionIncrease?: number;
};

export type GoalPlanInput = {
  goalAmount: number;
  currentBalance: number;
  currentMonthlyContribution: number;
  years: number;
  annualReturn: number;
};

export type GrowthYearSnapshot = {
  year: number;
  balance: number;
  totalContributed: number;
  estimatedGrowth: number;
  monthlyContribution: number;
};

export type GrowthProjectionResult = {
  futureValue: number;
  totalContributed: number;
  totalNewContributions: number;
  estimatedGrowth: number;
  timeline: GrowthYearSnapshot[];
  assumptions: {
    years: number;
    annualReturn: number;
    annualContributionIncrease: number;
  };
};

export type GoalPlanResult = {
  requiredMonthlyContribution: number;
  currentPlanFutureValue: number;
  monthlyGap: number;
  goalAmount: number;
  startingBalance: number;
  totalContributed: number;
  estimatedGrowth: number;
  percentFundedToday: number;
  projectedPercentOfGoal: number;
  timeline: GrowthYearSnapshot[];
};

function cleanNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function clampNonNegative(value: number): number {
  return Math.max(0, cleanNumber(value));
}

function roundCurrency(value: number): number {
  return Math.round(cleanNumber(value));
}

function monthlyRateFromAnnualReturn(annualReturn: number): number {
  return cleanNumber(annualReturn) / 100 / 12;
}

export function formatGrowthCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(roundCurrency(value));
}

export function calculateGrowthProjection(input: GrowthProjectionInput): GrowthProjectionResult {
  const startingBalance = clampNonNegative(input.startingBalance);
  const years = Math.max(1, Math.round(clampNonNegative(input.years)));
  const annualReturn = cleanNumber(input.annualReturn);
  const monthlyRate = monthlyRateFromAnnualReturn(annualReturn);
  const annualContributionIncrease = clampNonNegative(input.annualContributionIncrease ?? 0);

  let balance = startingBalance;
  let monthlyContribution = clampNonNegative(input.monthlyContribution);
  let totalNewContributions = 0;
  const timeline: GrowthYearSnapshot[] = [];

  for (let month = 1; month <= years * 12; month += 1) {
    balance = balance * (1 + monthlyRate);
    balance += monthlyContribution;
    totalNewContributions += monthlyContribution;

    if (month % 12 === 0) {
      const year = month / 12;
      const totalContributed = startingBalance + totalNewContributions;
      timeline.push({
        year,
        balance: roundCurrency(balance),
        totalContributed: roundCurrency(totalContributed),
        estimatedGrowth: roundCurrency(balance - totalContributed),
        monthlyContribution: roundCurrency(monthlyContribution),
      });

      monthlyContribution *= 1 + annualContributionIncrease / 100;
    }
  }

  const totalContributed = startingBalance + totalNewContributions;

  return {
    futureValue: roundCurrency(balance),
    totalContributed: roundCurrency(totalContributed),
    totalNewContributions: roundCurrency(totalNewContributions),
    estimatedGrowth: roundCurrency(balance - totalContributed),
    timeline,
    assumptions: {
      years,
      annualReturn,
      annualContributionIncrease,
    },
  };
}

export function calculateRequiredMonthlyContribution(input: GoalPlanInput): number {
  const goalAmount = clampNonNegative(input.goalAmount);
  const currentBalance = clampNonNegative(input.currentBalance);
  const years = Math.max(1, Math.round(clampNonNegative(input.years)));
  const monthlyRate = monthlyRateFromAnnualReturn(input.annualReturn);
  const months = years * 12;

  const futureValueOfCurrentBalance = currentBalance * Math.pow(1 + monthlyRate, months);
  const remainingGoal = goalAmount - futureValueOfCurrentBalance;

  if (remainingGoal <= 0) return 0;

  if (monthlyRate === 0) {
    return roundCurrency(remainingGoal / months);
  }

  const annuityFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return roundCurrency(remainingGoal / annuityFactor);
}

export function calculateGoalPlan(input: GoalPlanInput): GoalPlanResult {
  const requiredMonthlyContribution = calculateRequiredMonthlyContribution(input);
  const currentMonthlyContribution = clampNonNegative(input.currentMonthlyContribution);

  const currentPlan = calculateGrowthProjection({
    startingBalance: input.currentBalance,
    monthlyContribution: currentMonthlyContribution,
    years: input.years,
    annualReturn: input.annualReturn,
    annualContributionIncrease: 0,
  });

  const requiredPlan = calculateGrowthProjection({
    startingBalance: input.currentBalance,
    monthlyContribution: requiredMonthlyContribution,
    years: input.years,
    annualReturn: input.annualReturn,
    annualContributionIncrease: 0,
  });

  const goalAmount = clampNonNegative(input.goalAmount);
  const startingBalance = clampNonNegative(input.currentBalance);

  return {
    requiredMonthlyContribution,
    currentPlanFutureValue: currentPlan.futureValue,
    monthlyGap: Math.max(0, requiredMonthlyContribution - currentMonthlyContribution),
    goalAmount,
    startingBalance,
    totalContributed: requiredPlan.totalContributed,
    estimatedGrowth: requiredPlan.estimatedGrowth,
    percentFundedToday: goalAmount > 0 ? Math.min(100, (startingBalance / goalAmount) * 100) : 0,
    projectedPercentOfGoal: goalAmount > 0 ? Math.min(999, (currentPlan.futureValue / goalAmount) * 100) : 0,
    timeline: requiredPlan.timeline,
  };
}

export function getReadableYearLabel(years: number): string {
  const safeYears = Math.max(1, Math.round(cleanNumber(years)));
  return safeYears === 1 ? '1 year' : `${safeYears} years`;
}
