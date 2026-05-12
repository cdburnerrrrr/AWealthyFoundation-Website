export type EmployerMatchFormula =
  | 'tiered_100_50'
  | 'dollar_for_dollar'
  | 'half_match'
  | 'custom';

export type EmployerMatchInputs = {
  annualSalary: number;
  currentContributionPercent: number;
  currentBalance: number;
  years: number;
  annualReturn: number;
  formula: EmployerMatchFormula;
  dollarMatchLimitPercent: number;
  halfMatchLimitPercent: number;
  customEmployeeLimitPercent: number;
  customMatchRatePercent: number;
};

export type EmployerMatchResult = {
  annualEmployeeContribution: number;
  monthlyEmployeeContribution: number;
  currentAnnualEmployerMatch: number;
  fullAnnualEmployerMatch: number;
  missedAnnualMatch: number;
  requiredContributionPercent: number;
  additionalContributionPercent: number;
  additionalAnnualContribution: number;
  additionalMonthlyContribution: number;
  capturedPercent: number;
  projectedMissedMatchValue: number;
  projectedCurrentPathValue: number;
  projectedFullMatchPathValue: number;
  recommendationLabel: string;
  recommendationBody: string;
};

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function roundCurrency(value: number) {
  return Math.round(Number.isFinite(value) ? value : 0);
}

function toSafePercent(value: number, max = 100) {
  return clamp(value, 0, max);
}

function contributionFutureValue(monthlyContribution: number, years: number, annualReturn: number) {
  const months = Math.max(0, Math.round(years * 12));
  const monthlyRate = Math.max(-0.99, annualReturn / 100) / 12;

  if (months <= 0 || monthlyContribution <= 0) return 0;
  if (monthlyRate === 0) return monthlyContribution * months;

  return monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

function balanceFutureValue(balance: number, years: number, annualReturn: number) {
  const months = Math.max(0, Math.round(years * 12));
  const monthlyRate = Math.max(-0.99, annualReturn / 100) / 12;

  if (months <= 0 || balance <= 0) return balance;
  return balance * Math.pow(1 + monthlyRate, months);
}

function getMatchDetails(input: EmployerMatchInputs, contributionPercent: number) {
  const salary = Math.max(0, input.annualSalary);
  const safeContributionPercent = toSafePercent(contributionPercent);

  if (input.formula === 'tiered_100_50') {
    const firstTierPercent = Math.min(safeContributionPercent, 3);
    const secondTierPercent = Math.min(Math.max(safeContributionPercent - 3, 0), 2);

    return {
      match: salary * (firstTierPercent / 100) + salary * (secondTierPercent / 100) * 0.5,
      requiredContributionPercent: 5,
      fullMatch: salary * 0.04,
    };
  }

  if (input.formula === 'dollar_for_dollar') {
    const limit = toSafePercent(input.dollarMatchLimitPercent, 25);
    const matchedPercent = Math.min(safeContributionPercent, limit);

    return {
      match: salary * (matchedPercent / 100),
      requiredContributionPercent: limit,
      fullMatch: salary * (limit / 100),
    };
  }

  if (input.formula === 'half_match') {
    const limit = toSafePercent(input.halfMatchLimitPercent, 25);
    const matchedPercent = Math.min(safeContributionPercent, limit);

    return {
      match: salary * (matchedPercent / 100) * 0.5,
      requiredContributionPercent: limit,
      fullMatch: salary * (limit / 100) * 0.5,
    };
  }

  const limit = toSafePercent(input.customEmployeeLimitPercent, 25);
  const matchRate = toSafePercent(input.customMatchRatePercent, 200) / 100;
  const matchedPercent = Math.min(safeContributionPercent, limit);

  return {
    match: salary * (matchedPercent / 100) * matchRate,
    requiredContributionPercent: limit,
    fullMatch: salary * (limit / 100) * matchRate,
  };
}

export function calculateEmployerMatch(input: EmployerMatchInputs): EmployerMatchResult {
  const annualSalary = Math.max(0, input.annualSalary);
  const currentContributionPercent = toSafePercent(input.currentContributionPercent);
  const years = clamp(input.years, 0, 60);
  const annualReturn = clamp(input.annualReturn, -50, 50);

  const annualEmployeeContribution = annualSalary * (currentContributionPercent / 100);
  const currentMatchDetails = getMatchDetails(input, currentContributionPercent);
  const fullMatchDetails = getMatchDetails(input, currentMatchDetails.requiredContributionPercent);

  const currentAnnualEmployerMatch = currentMatchDetails.match;
  const fullAnnualEmployerMatch = fullMatchDetails.fullMatch;
  const missedAnnualMatch = Math.max(0, fullAnnualEmployerMatch - currentAnnualEmployerMatch);
  const additionalContributionPercent = Math.max(
    0,
    currentMatchDetails.requiredContributionPercent - currentContributionPercent
  );
  const additionalAnnualContribution = annualSalary * (additionalContributionPercent / 100);
  const additionalMonthlyContribution = additionalAnnualContribution / 12;
  const capturedPercent =
    fullAnnualEmployerMatch > 0
      ? clamp((currentAnnualEmployerMatch / fullAnnualEmployerMatch) * 100, 0, 100)
      : 0;

  const projectedMissedMatchValue = contributionFutureValue(missedAnnualMatch / 12, years, annualReturn);
  const currentPathMonthly = (annualEmployeeContribution + currentAnnualEmployerMatch) / 12;
  const fullMatchPathMonthly =
    (annualSalary * (currentMatchDetails.requiredContributionPercent / 100) + fullAnnualEmployerMatch) / 12;

  const projectedCurrentPathValue =
    balanceFutureValue(Math.max(0, input.currentBalance), years, annualReturn) +
    contributionFutureValue(currentPathMonthly, years, annualReturn);

  const projectedFullMatchPathValue =
    balanceFutureValue(Math.max(0, input.currentBalance), years, annualReturn) +
    contributionFutureValue(fullMatchPathMonthly, years, annualReturn);

  let recommendationLabel = 'Review your plan formula';
  let recommendationBody =
    'Make sure your employer match formula is entered correctly, then compare the current path with the full-match path.';

  if (fullAnnualEmployerMatch <= 0) {
    recommendationLabel = 'No match modeled yet';
    recommendationBody =
      'Enter a workplace match formula to estimate whether there is employer money available.';
  } else if (missedAnnualMatch <= 1) {
    recommendationLabel = 'Full match captured';
    recommendationBody =
      'Based on these inputs, you are already contributing enough to capture the full employer match.';
  } else if (additionalMonthlyContribution <= 100) {
    recommendationLabel = 'Small increase, meaningful win';
    recommendationBody =
      'A relatively small monthly increase could capture the rest of the employer match.';
  } else {
    recommendationLabel = 'Match gap worth reviewing';
    recommendationBody =
      'You may be leaving employer match dollars on the table. Consider whether your monthly cash flow can support a step-up toward the full match.';
  }

  return {
    annualEmployeeContribution: roundCurrency(annualEmployeeContribution),
    monthlyEmployeeContribution: roundCurrency(annualEmployeeContribution / 12),
    currentAnnualEmployerMatch: roundCurrency(currentAnnualEmployerMatch),
    fullAnnualEmployerMatch: roundCurrency(fullAnnualEmployerMatch),
    missedAnnualMatch: roundCurrency(missedAnnualMatch),
    requiredContributionPercent: Number(currentMatchDetails.requiredContributionPercent.toFixed(2)),
    additionalContributionPercent: Number(additionalContributionPercent.toFixed(2)),
    additionalAnnualContribution: roundCurrency(additionalAnnualContribution),
    additionalMonthlyContribution: roundCurrency(additionalMonthlyContribution),
    capturedPercent: Math.round(capturedPercent),
    projectedMissedMatchValue: roundCurrency(projectedMissedMatchValue),
    projectedCurrentPathValue: roundCurrency(projectedCurrentPathValue),
    projectedFullMatchPathValue: roundCurrency(projectedFullMatchPathValue),
    recommendationLabel,
    recommendationBody,
  };
}

export function formatMatchCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(Number.isFinite(value) ? value : 0));
}

export function getFormulaLabel(formula: EmployerMatchFormula) {
  switch (formula) {
    case 'tiered_100_50':
      return '100% on first 3%, then 50% on next 2%';
    case 'dollar_for_dollar':
      return 'Dollar-for-dollar up to a limit';
    case 'half_match':
      return '50% match up to a limit';
    case 'custom':
      return 'Custom match formula';
    default:
      return 'Employer match';
  }
}
