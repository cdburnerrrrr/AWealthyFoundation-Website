import { supabase } from '../lib/supabase';

/**
 * Assessment Service V2
 *
 * This file keeps your existing Supabase loader and adds a reusable V2 scoring
 * engine for the assessment/report/dashboard pipeline.
 *
 * Important: this exports pure functions only. UI files should call these
 * functions or consume the saved report/metrics produced by them.
 */

export type AssessmentType = 'free' | 'detailed' | 'premium';
export type BuildingBlockKey =
  | 'income'
  | 'spending'
  | 'saving'
  | 'debt'
  | 'protection'
  | 'investing'
  | 'vision';

export type PillarKey = BuildingBlockKey;

export type LifeStage = 'starting_out' | 'stability' | 'growth' | 'catch_up';

export type V2FinancialMetrics = {
  // Existing dashboard/report compatibility fields
  debtToIncomeRatio: number;
  fixedCostPressureRatio: number;
  savingsRate: number;
  netWorth: number;
  homeEquity: number;
  totalSavings: number;
  totalInvestments: number;
  totalDebtBalance: number;
  monthlyIncome: number;
  monthlyDebtPayments: number;
  monthlyHousingCost: number;
  monthlyUtilities: number;
  monthlyChildcareCost: number;
  monthlyFixedCosts: number;
  monthlyInvestmentContribution: number;
  investmentContributionRate: number;
  liquidAssets: number;
  illiquidAssets: number;
  liquidAssetRatio: number;
  illiquidAssetRatio: number;

  // V2 asset/liability detail
  cashSavings: number;
  hysaBalance: number;
  retirement401kIraBalance: number;
  rothBalance: number;
  brokerageBalance: number;
  pensionBalance: number;
  otherInvestmentAssets: number;
  otherAssets: number;

  primaryHomeValue: number;
  primaryMortgageBalance: number;
  rentalPropertyValue: number;
  rentalMortgageBalance: number;
  otherPropertyValue: number;
  otherPropertyMortgageBalance: number;

  realEstateAssets: number;
  mortgageDebt: number;
  consumerDebt: number;
  otherLiabilities: number;
  totalAssets: number;
  totalLiabilities: number;

  monthlyMortgageOrRent: number;
  housingRatio: number;
  mortgageDebtToAssetRatio: number;

  emergencyFundMonths: number;
  cappedEmergencyFundMonths: number;
  cushionScore: number;
  cashExcessMonths: number;
  excessCashEstimate: number;
};

export type V2Signals = {
  highHousingBurden: boolean;
  housePoorRisk: boolean;
  veryHighHousingBurden: boolean;
  highFixedCostPressure: boolean;
  veryHighFixedCostPressure: boolean;
  highConsumerDebt: boolean;
  hasMortgageOnlyDebt: boolean;
  hasMeaningfulInvestments: boolean;
  strongInvestmentHabit: boolean;
  excessCashLikely: boolean;
  eliteCashCushion: boolean;
  hasDependents: boolean;
  hasLifeInsurance: boolean;
  dependentsWithoutLifeInsurance: boolean;
  protectionCoverageCount: number;
  incompleteNetWorthData: boolean;
};

export type V2Report = {
  foundationScore: number;
  scoreBand: string;
  buildingBlockScores: Record<BuildingBlockKey, number>;
  pillarScores: Record<PillarKey, number>;
  biggestOpportunity: PillarKey;
  lifeStage: LifeStage;
  insights: string[];
  priorities: string[];
  summary: string;
  nextStep: string;
  metrics: V2FinancialMetrics;
  signals: V2Signals;
  structuralWarnings: {
    type:
      | 'housing_pressure'
      | 'income_constraint'
      | 'structural_pressure'
      | 'excess_cash'
      | 'protection_gap'
      | 'net_worth_data_gap';
    severity: 'medium' | 'high';
    message: string;
  }[];
  actionPlan: {
    immediate: { title: string; body: string; checklist: string[] }[];
    shortTerm: { title: string; body: string; checklist: string[] }[];
    longTerm: { title: string; body: string; checklist: string[] }[];
  };
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number) {
  return Math.round(Number.isFinite(value) ? value : 0);
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function firstNumber(answers: Record<string, any>, keys: string[]): number {
  for (const key of keys) {
    const value = toNumber(answers[key]);
    if (value > 0) return value;
  }
  return 0;
}

function includesValue(value: unknown, target: string): boolean {
  if (Array.isArray(value)) return value.includes(target);
  return value === target || value === true;
}

function yes(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === 'string') {
    return ['yes', 'true', 'covered', 'have', 'has', 'adequate', 'fully_covered'].includes(
      value.toLowerCase()
    );
  }
  return false;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(round(value));
}

function getScoreBand(score: number): string {
  if (score >= 80) return 'Strong Foundation';
  if (score >= 60) return 'Building Momentum';
  if (score >= 40) return 'Needs Attention';
  return 'At Risk';
}

function getLiquidSavings(answers: Record<string, any>) {
  return firstNumber(answers, [
    'cashSavings',
    'hysaBalance',
    'totalLiquidSavings',
    'totalSavings',
    'liquidSavings',
  ]);
}

function getInvestmentTotal(answers: Record<string, any>) {
  const itemized =
    toNumber(answers.retirement401kIraBalance) +
    toNumber(answers.retirementAccounts) +
    toNumber(answers.k401Balance) +
    toNumber(answers.iraBalance) +
    toNumber(answers.rothBalance) +
    toNumber(answers.rothAccounts) +
    toNumber(answers.brokerageBalance) +
    toNumber(answers.brokerageAccounts) +
    toNumber(answers.pensionBalance) +
    toNumber(answers.otherInvestmentAssets) +
    toNumber(answers.otherInvestments);

  const legacy = firstNumber(answers, ['totalInvestments', 'investmentBalance']);

  return Math.max(itemized, legacy);
}

function getConsumerDebt(answers: Record<string, any>) {
  const itemized =
    toNumber(answers.creditCardDebt) +
    toNumber(answers.autoLoans) +
    toNumber(answers.carLoanBalance) +
    toNumber(answers.studentLoans) +
    toNumber(answers.personalLoans) +
    toNumber(answers.medicalDebt) +
    toNumber(answers.bnplDebt) +
    toNumber(answers.paydayDebt);

  const legacy = firstNumber(answers, ['consumerDebtBalance']);

  return Math.max(itemized, legacy);
}

function getConsumerDebtPayments(answers: Record<string, any>) {
  return firstNumber(answers, [
    'monthlyConsumerDebtPayments',
    'monthlyDebtPayments',
    'monthlyVehiclePayment',
  ]);
}

function getRealEstateAssets(answers: Record<string, any>) {
  return (
    toNumber(answers.primaryHomeValue) +
    toNumber(answers.homeValue) +
    toNumber(answers.rentalPropertyValue) +
    toNumber(answers.otherPropertyValue)
  );
}

function getMortgageDebt(answers: Record<string, any>) {
  return (
    toNumber(answers.primaryMortgageBalance) +
    toNumber(answers.primaryMortgage) +
    toNumber(answers.mortgageBalance) +
    toNumber(answers.rentalMortgageBalance) +
    toNumber(answers.rentalMortgage) +
    toNumber(answers.otherPropertyMortgageBalance) +
    toNumber(answers.otherPropertyDebt)
  );
}

function getOtherAssets(answers: Record<string, any>) {
  return toNumber(answers.otherAssets) + toNumber(answers.otherAssetsNotListed);
}

function getOtherLiabilities(answers: Record<string, any>) {
  return (
    toNumber(answers.otherLiabilities) +
    toNumber(answers.otherDebtNotListed) +
    toNumber(answers.additionalDebt)
  );
}

function hasDependents(answers: Record<string, any>) {
  return (
    ['single_with_dependents', 'partnered_with_dependents'].includes(
      answers.relationshipStatus
    ) ||
    yes(answers.hasDependents) ||
    toNumber(answers.numberOfDependents) > 0
  );
}

function hasCoverage(answers: Record<string, any>, key: string, legacyKey?: string) {
  const coverage =
    answers.protectionCoverage ??
    answers.protectionCoverages ??
    answers.insuranceCoverages ??
    [];

  const aliases: Record<string, string[]> = {
    hasHealthInsurance: ['health', 'health_insurance', 'good_coverage', 'basic_coverage'],
    hasAutoInsurance: ['auto', 'auto_insurance', 'full', 'basic'],
    hasHomeInsurance: ['home_or_renters', 'home', 'renters', 'property', 'solid', 'basic'],
    hasLifeInsurance: ['life', 'life_insurance', 'enough', 'some'],
    hasDisabilityInsurance: ['disability', 'income_interruption', 'very_prepared', 'somewhat_prepared'],
    hasUmbrellaPolicy: ['umbrella', 'umbrella_policy'],
  };

  const accepted = [key, legacyKey, ...(aliases[key] ?? []), ...(legacyKey ? aliases[legacyKey] ?? [] : [])]
    .filter(Boolean) as string[];

  return accepted.some((item) => yes(answers[item]) || includesValue(coverage, item)) ||
    (legacyKey ? yes(answers[legacyKey]) : false);
}

export function buildV2FinancialMetrics(
  answers: Record<string, any>
): V2FinancialMetrics {
  const monthlyIncome = firstNumber(answers, ['monthlyTakeHomeIncome', 'monthlyIncome']);
  const monthlyHousingCost = firstNumber(answers, [
    'monthlyHousingCost',
    'monthlyRent',
    'monthlyMortgagePayment',
  ]);
  const monthlyUtilities = firstNumber(answers, ['monthlyUtilities']);
  const monthlyChildcareCost = firstNumber(answers, ['monthlyChildcareCost']);
  const monthlyDebtPayments = getConsumerDebtPayments(answers);
  const monthlyInvestmentContribution = firstNumber(answers, [
    'monthlyInvestmentContribution',
    'monthly401kContribution',
    'monthlyRetirementContribution',
    'monthlyInvestingAmount',
    'monthlyInvestmentAmount',
  ]);

  const monthlyFixedCosts =
    firstNumber(answers, ['monthlyFixedCosts']) ||
    monthlyHousingCost + monthlyUtilities + monthlyChildcareCost + monthlyDebtPayments;

  const cashSavings = getLiquidSavings(answers);
  const hysaBalance = toNumber(answers.hysaBalance);
  const retirement401kIraBalance =
    toNumber(answers.retirement401kIraBalance) +
    toNumber(answers.retirementAccounts) +
    toNumber(answers.k401Balance) +
    toNumber(answers.iraBalance);
  const rothBalance = toNumber(answers.rothBalance) + toNumber(answers.rothAccounts);
  const brokerageBalance = toNumber(answers.brokerageBalance) + toNumber(answers.brokerageAccounts);
  const pensionBalance = toNumber(answers.pensionBalance);
  const otherInvestmentAssets = toNumber(answers.otherInvestmentAssets) + toNumber(answers.otherInvestments);

  const totalInvestments = getInvestmentTotal(answers);
  const primaryHomeValue = toNumber(answers.primaryHomeValue) || toNumber(answers.homeValue);
  const primaryMortgageBalance =
    toNumber(answers.primaryMortgageBalance) || toNumber(answers.primaryMortgage) || toNumber(answers.mortgageBalance);
  const rentalPropertyValue = toNumber(answers.rentalPropertyValue);
  const rentalMortgageBalance = toNumber(answers.rentalMortgageBalance) || toNumber(answers.rentalMortgage);
  const otherPropertyValue = toNumber(answers.otherPropertyValue);
  const otherPropertyMortgageBalance =
    toNumber(answers.otherPropertyMortgageBalance) || toNumber(answers.otherPropertyDebt);

  const realEstateAssets = getRealEstateAssets(answers);
  const mortgageDebt = getMortgageDebt(answers);
  const consumerDebt = getConsumerDebt(answers);
  const otherAssets = getOtherAssets(answers);
  const otherLiabilities = getOtherLiabilities(answers);

  const totalAssets = cashSavings + totalInvestments + realEstateAssets + otherAssets;
  const totalLiabilities = mortgageDebt + consumerDebt + otherLiabilities;
  const netWorth = totalAssets - totalLiabilities;
  const homeEquity = Math.max(0, realEstateAssets - mortgageDebt);
  const liquidAssets = cashSavings + brokerageBalance;
  const illiquidAssets = retirement401kIraBalance + rothBalance + pensionBalance + otherInvestmentAssets + homeEquity;
  const liquidAssetRatio = totalAssets > 0 ? (liquidAssets / totalAssets) * 100 : 0;
  const illiquidAssetRatio = totalAssets > 0 ? (illiquidAssets / totalAssets) * 100 : 0;

  const fixedCostPressureRatio =
    monthlyIncome > 0 ? (monthlyFixedCosts / monthlyIncome) * 100 : 0;
  const debtToIncomeRatio =
    monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;
  const housingRatio = monthlyIncome > 0 ? (monthlyHousingCost / monthlyIncome) * 100 : 0;
  const mortgageDebtToAssetRatio =
    realEstateAssets > 0 ? (mortgageDebt / realEstateAssets) * 100 : 0;
  const investmentContributionRate =
    monthlyIncome > 0 ? (monthlyInvestmentContribution / monthlyIncome) * 100 : 0;

  const savingsRate =
    monthlyIncome > 0
      ? (firstNumber(answers, ['monthlySavings', 'monthlyInvestmentContribution', 'monthly401kContribution', 'monthlyRetirementContribution', 'monthlyInvestingAmount']) / monthlyIncome) *
        100
      : toNumber(answers.investingPercent) || toNumber(answers.retirementContributionPercent);

  const emergencyFundMonths =
    monthlyFixedCosts > 0 ? cashSavings / monthlyFixedCosts : 0;
  const cappedEmergencyFundMonths = Math.min(emergencyFundMonths, 24);
  const cushionScore = round((cappedEmergencyFundMonths / 24) * 100);

  const targetCashMonths = 12;
  const cashTarget = monthlyFixedCosts * targetCashMonths;
  const excessCashEstimate =
    monthlyFixedCosts > 0 && cashSavings > cashTarget ? cashSavings - cashTarget : 0;
  const cashExcessMonths =
    monthlyFixedCosts > 0 ? Math.max(0, emergencyFundMonths - targetCashMonths) : 0;

  return {
    debtToIncomeRatio,
    fixedCostPressureRatio,
    savingsRate,
    netWorth,
    homeEquity,
    totalSavings: cashSavings,
    totalInvestments,
    totalDebtBalance: consumerDebt,
    monthlyIncome,
    monthlyDebtPayments,
    monthlyHousingCost,
    monthlyUtilities,
    monthlyChildcareCost,
    monthlyFixedCosts,
    monthlyInvestmentContribution,
    investmentContributionRate,
    liquidAssets,
    illiquidAssets,
    liquidAssetRatio,
    illiquidAssetRatio,

    cashSavings,
    hysaBalance,
    retirement401kIraBalance,
    rothBalance,
    brokerageBalance,
    pensionBalance,
    otherInvestmentAssets,
    otherAssets,

    primaryHomeValue,
    primaryMortgageBalance,
    rentalPropertyValue,
    rentalMortgageBalance,
    otherPropertyValue,
    otherPropertyMortgageBalance,

    realEstateAssets,
    mortgageDebt,
    consumerDebt,
    otherLiabilities,
    totalAssets,
    totalLiabilities,

    monthlyMortgageOrRent: monthlyHousingCost,
    housingRatio,
    mortgageDebtToAssetRatio,

    emergencyFundMonths,
    cappedEmergencyFundMonths,
    cushionScore,
    cashExcessMonths,
    excessCashEstimate,
  };
}

export function deriveV2Signals(
  answers: Record<string, any>,
  metrics = buildV2FinancialMetrics(answers)
): V2Signals {
  const health = hasCoverage(answers, 'hasHealthInsurance', 'healthInsurance');
  const auto = hasCoverage(answers, 'hasAutoInsurance', 'autoCoverage');
  const home = hasCoverage(answers, 'hasHomeInsurance', 'propertyCoverage');
  const life = hasCoverage(answers, 'hasLifeInsurance', 'lifeInsurance');
  const disability = hasCoverage(
    answers,
    'hasDisabilityInsurance',
    'incomeInterruptionCoverage'
  );
  const umbrella = hasCoverage(answers, 'hasUmbrellaPolicy', 'umbrellaPolicy');

  const protectionCoverageCount = [health, auto, home, life, disability, umbrella].filter(
    Boolean
  ).length;

  const dependents = hasDependents(answers);

  return {
    highHousingBurden: metrics.housingRatio >= 30,
    housePoorRisk: metrics.housingRatio >= 35 || metrics.fixedCostPressureRatio >= 60,
    veryHighHousingBurden: metrics.housingRatio >= 40,
    highFixedCostPressure: metrics.fixedCostPressureRatio >= 50,
    veryHighFixedCostPressure: metrics.fixedCostPressureRatio >= 70,
    highConsumerDebt: metrics.debtToIncomeRatio >= 15 || metrics.consumerDebt >= 25000,
    hasMortgageOnlyDebt: metrics.mortgageDebt > 0 && metrics.consumerDebt === 0,
    hasMeaningfulInvestments: metrics.totalInvestments >= 50000,
    strongInvestmentHabit:
      metrics.investmentContributionRate >= 10 ||
      toNumber(answers.investingPercent) >= 15 ||
      toNumber(answers.retirementContributionPercent) >= 15 ||
      metrics.investmentContributionRate >= 10 ||
      answers.investingStatus === 'yes_consistently',
    excessCashLikely: metrics.emergencyFundMonths > 24 || metrics.excessCashEstimate > 0,
    eliteCashCushion: metrics.emergencyFundMonths >= 24,
    hasDependents: dependents,
    hasLifeInsurance: life,
    dependentsWithoutLifeInsurance: dependents && !life,
    protectionCoverageCount,
    incompleteNetWorthData:
      metrics.cashSavings > 0 &&
      metrics.totalInvestments === 0 &&
      metrics.realEstateAssets === 0 &&
      metrics.consumerDebt === 0 &&
      metrics.mortgageDebt === 0,
  };
}

function scoreIncome(answers: Record<string, any>, metrics: V2FinancialMetrics) {
  let score = 55;

  if (metrics.monthlyIncome > 0) score += 10;

  const consistency = answers.incomeConsistency;
  if (consistency === 'very_consistent' || consistency === 'very_stable' || consistency === 'stable') score += 20;
  else if (consistency === 'mostly_consistent' || consistency === 'mostly_stable') score += 12;
  else if (consistency === 'variable') score += 4;
  else if (consistency === 'highly_unpredictable' || consistency === 'unstable') score -= 10;

  const growth = answers.incomeGrowthPotential;
  if (growth === 'high') score += 10;
  else if (growth === 'moderate') score += 6;
  else if (growth === 'limited' || growth === 'low') score += 1;

  if (metrics.monthlyIncome >= 6000) score += 5;
  if (metrics.monthlyIncome <= 0) score -= 15;

  return clamp(round(score));
}

function scoreSpending(_answers: Record<string, any>, metrics: V2FinancialMetrics) {
  let score = 100;

  if (metrics.fixedCostPressureRatio >= 70) score -= 45;
  else if (metrics.fixedCostPressureRatio >= 60) score -= 32;
  else if (metrics.fixedCostPressureRatio >= 50) score -= 18;
  else if (metrics.fixedCostPressureRatio >= 40) score -= 8;

  if (metrics.housingRatio >= 40) score -= 20;
  else if (metrics.housingRatio >= 35) score -= 12;
  else if (metrics.housingRatio >= 30) score -= 6;

  return clamp(round(score));
}

function scoreSaving(metrics: V2FinancialMetrics) {
  // 24+ months is capped elite. This fixes the “60 months = only 86%” issue.
  return clamp(round(metrics.cushionScore));
}

function scoreInvesting(answers: Record<string, any>, metrics: V2FinancialMetrics) {
  let score = 35;

  const percentRate =
    toNumber(answers.investingPercent) ||
    toNumber(answers.retirementContributionPercent) ||
    toNumber(answers.investmentContributionPercent);

  const rate = percentRate || metrics.investmentContributionRate;

  if (rate >= 15) score = 90;
  else if (rate >= 10) score = 78;
  else if (rate >= 5) score = 62;

  // If the user gave strong balances but no contribution percentage, avoid treating
  // missing rate data as weak investing.
  if (rate === 0) {
    if (metrics.totalInvestments >= 500000) score = 88;
    else if (metrics.totalInvestments >= 250000) score = 82;
    else if (metrics.totalInvestments >= 100000) score = 74;
    else if (metrics.totalInvestments >= 50000) score = 66;
  }

  if (answers.investingStatus === 'yes_consistently') score += 8;
  if (answers.employerMatch === 'maximizing_match') score += 5;

  if (metrics.totalInvestments >= 500000) score += 10;
  else if (metrics.totalInvestments >= 250000) score += 8;
  else if (metrics.totalInvestments >= 100000) score += 6;
  else if (metrics.totalInvestments >= 50000) score += 4;

  if (metrics.totalInvestments === 0 && rate === 0 && answers.investingStatus !== 'yes_consistently') score = 25;

  return clamp(round(score));
}

function scoreDebt(metrics: V2FinancialMetrics) {
  let score = 100;

  // Consumer debt is the main penalty.
  if (metrics.debtToIncomeRatio >= 25) score -= 55;
  else if (metrics.debtToIncomeRatio >= 15) score -= 35;
  else if (metrics.debtToIncomeRatio >= 8) score -= 18;
  else if (metrics.debtToIncomeRatio > 0) score -= 8;

  if (metrics.consumerDebt >= 50000) score -= 15;
  else if (metrics.consumerDebt >= 25000) score -= 8;

  // Affordable mortgage debt should not heavily punish the user.
  if (metrics.mortgageDebt > 0) {
    if (metrics.housingRatio >= 40) score -= 12;
    else if (metrics.housingRatio >= 35) score -= 8;
    else if (metrics.housingRatio >= 30) score -= 4;
  }

  return clamp(round(score));
}

function scoreProtection(answers: Record<string, any>, signals: V2Signals) {
  let score = 0;

  if (hasCoverage(answers, 'hasHealthInsurance', 'healthInsurance')) score += 20;
  if (hasCoverage(answers, 'hasAutoInsurance', 'autoCoverage')) score += 10;
  if (hasCoverage(answers, 'hasHomeInsurance', 'propertyCoverage')) score += 15;
  if (hasCoverage(answers, 'hasLifeInsurance', 'lifeInsurance')) score += 20;
  if (hasCoverage(answers, 'hasDisabilityInsurance', 'incomeInterruptionCoverage')) score += 20;
  if (hasCoverage(answers, 'hasUmbrellaPolicy', 'umbrellaPolicy')) score += 15;

  // Legacy broad “insured” answers get some credit, but not perfect credit.
  if (score === 0 && yes(answers.healthInsurance)) score += 20;

  if (signals.dependentsWithoutLifeInsurance) score -= 20;

  return clamp(round(score));
}

function scoreVision(answers: Record<string, any>) {
  let score = 50;

  if (answers.financialDirection === 'very_clear' || answers.financialDirection === 'clear_goals') score += 25;
  else if (answers.financialDirection === 'fairly_clear' || answers.financialDirection === 'some_goals') score += 15;
  else if (answers.financialDirection === 'unclear' || answers.financialDirection === 'figuring_it_out') score += 5;

  if (answers.primaryFinancialPriority) score += 10;

  const confidence = answers.financialConfidence;
  if (confidence === 'very_confident') score += 15;
  else if (confidence === 'somewhat_confident') score += 8;
  else if (confidence === 'low' || confidence === 'not_confident') score -= 5;
  else if (confidence === 'overwhelmed') score -= 10;

  return clamp(round(score));
}

export function calculateV2BuildingBlockScores(
  answers: Record<string, any>
): Record<BuildingBlockKey, number> {
  const metrics = buildV2FinancialMetrics(answers);
  const signals = deriveV2Signals(answers, metrics);

  return {
    income: scoreIncome(answers, metrics),
    spending: scoreSpending(answers, metrics),
    saving: scoreSaving(metrics),
    investing: scoreInvesting(answers, metrics),
    debt: scoreDebt(metrics),
    protection: scoreProtection(answers, signals),
    vision: scoreVision(answers),
  };
}

export function calculateV2FoundationScore(pillars: Record<string, number>) {
  return round(
    Number(pillars.income ?? 0) * 0.15 +
      Number(pillars.spending ?? 0) * 0.15 +
      Number(pillars.saving ?? 0) * 0.18 +
      Number(pillars.investing ?? 0) * 0.17 +
      Number(pillars.debt ?? 0) * 0.15 +
      Number(pillars.protection ?? 0) * 0.1 +
      Number(pillars.vision ?? 0) * 0.1
  );
}

export function getV2BiggestOpportunity(
  pillars: Record<BuildingBlockKey, number>,
  signals: V2Signals
): BuildingBlockKey {
  const weighted = { ...pillars };

  // Avoid telling highly protected/invested users that incomplete data is a weakness.
  if (signals.protectionCoverageCount >= 4) weighted.protection += 8;
  if (signals.hasMeaningfulInvestments) weighted.investing += 8;
  if (signals.hasMortgageOnlyDebt) weighted.debt += 5;

  if (signals.housePoorRisk) weighted.spending -= 8;
  if (signals.highConsumerDebt) weighted.debt -= 12;
  if (signals.dependentsWithoutLifeInsurance) weighted.protection -= 10;

  return Object.entries(weighted).sort((a, b) => a[1] - b[1])[0][0] as BuildingBlockKey;
}

export function determineV2LifeStage(
  answers: Record<string, any>,
  metrics = buildV2FinancialMetrics(answers)
): LifeStage {
  if (metrics.emergencyFundMonths < 3 || metrics.consumerDebt > 10000) {
    return 'starting_out';
  }

  if (metrics.totalInvestments < 25000) return 'stability';

  if (metrics.totalInvestments >= 100000 && metrics.emergencyFundMonths >= 6) {
    return 'growth';
  }

  return 'catch_up';
}

export function buildV2Insights(
  answers: Record<string, any>,
  metrics: V2FinancialMetrics,
  signals: V2Signals,
  biggestOpportunity: BuildingBlockKey
): string[] {
  const insights: string[] = [];

  if (signals.eliteCashCushion) {
    insights.push(
      `Your cash cushion is extremely strong at ${metrics.emergencyFundMonths.toFixed(
        1
      )} months. That protects your household, but anything beyond your target cushion may be worth moving into higher-yield savings or long-term investments.`
    );
  } else if (metrics.emergencyFundMonths >= 6) {
    insights.push(
      `Your cash cushion covers about ${metrics.emergencyFundMonths.toFixed(
        1
      )} months of core expenses, which gives your foundation real resilience.`
    );
  }

  if (signals.housePoorRisk) {
    insights.push(
      `Housing and fixed costs may be creating a house-poor risk. Your housing cost is about ${round(
        metrics.housingRatio
      )}% of take-home pay, and total fixed costs are about ${round(
        metrics.fixedCostPressureRatio
      )}%.`
    );
  }

  if (metrics.consumerDebt === 0 && metrics.mortgageDebt > 0) {
    insights.push(
      'Your debt picture appears to be mostly mortgage-related. Affordable mortgage debt should be treated differently than consumer debt, but it still matters for net worth and housing pressure.'
    );
  }

  if (metrics.netWorth > 0) {
    insights.push(
      `Your estimated net worth is ${formatCurrency(
        metrics.netWorth
      )}, based on the assets and liabilities included in the assessment.`
    );
  }

  if (metrics.monthlyInvestmentContribution > 0) {
    insights.push(
      `You are investing about ${formatCurrency(metrics.monthlyInvestmentContribution)} per month, which is roughly ${round(metrics.investmentContributionRate)}% of your take-home income.`
    );
  }

  if (signals.incompleteNetWorthData) {
    insights.push(
      'Your net worth may be incomplete because the assessment only has cash savings so far. Add investment, property, and liability balances for a more accurate picture.'
    );
  }

  if (biggestOpportunity === 'investing' && metrics.cashExcessMonths > 0) {
    insights.push(
      `You may be holding more cash than needed. After keeping your chosen emergency reserve, roughly ${formatCurrency(
        metrics.excessCashEstimate
      )} could potentially be redirected toward higher-yield savings, investing, or other priorities.`
    );
  }

  if (signals.dependentsWithoutLifeInsurance) {
    insights.push(
      'Because you have dependents, life insurance should be treated as a key protection layer rather than an optional extra.'
    );
  }

  if (!insights.length) {
    insights.push(
      'Your next best move is to strengthen the weakest part of the foundation without adding unnecessary complexity.'
    );
  }

  return insights.slice(0, 5);
}

function buildPriorities(
  pillars: Record<BuildingBlockKey, number>,
  biggestOpportunity: BuildingBlockKey,
  signals: V2Signals
): string[] {
  const priorities = [biggestOpportunity];

  if (signals.housePoorRisk && !priorities.includes('spending')) {
    priorities.push('spending');
  }

  if (signals.excessCashLikely && !priorities.includes('investing')) {
    priorities.push('investing');
  }

  Object.entries(pillars)
    .sort((a, b) => a[1] - b[1])
    .forEach(([key]) => {
      if (!priorities.includes(key as BuildingBlockKey)) {
        priorities.push(key as BuildingBlockKey);
      }
    });

  return priorities.slice(0, 3).map((key) => key);
}

function buildSummary(score: number, biggestOpportunity: BuildingBlockKey, metrics: V2FinancialMetrics) {
  if (score >= 80) {
    return `Your financial foundation is strong. The next opportunity is optimization: make sure your cash, investments, housing, protection, and tax buckets are working together efficiently.`;
  }

  if (metrics.fixedCostPressureRatio >= 60) {
    return `Your foundation has strengths, but fixed costs are creating meaningful pressure. Reducing housing or other fixed obligations could unlock faster progress across the system.`;
  }

  return `Your foundation is building momentum. The best next move is to focus on ${biggestOpportunity} while keeping the rest of the system steady.`;
}

function buildNextStep(biggestOpportunity: BuildingBlockKey, metrics: V2FinancialMetrics, signals: V2Signals) {
  const strongOverallPosition =
    metrics.netWorth >= 250000 ||
    metrics.totalInvestments >= 100000 ||
    signals.eliteCashCushion;

  if (strongOverallPosition && signals.excessCashLikely && metrics.excessCashEstimate > 0) {
    return 'Optimize your cash position. Keep the reserve that gives you confidence, then decide how much excess cash should move into higher-yield savings, investments, or another priority that can work harder for your household.';
  }

  if (strongOverallPosition && metrics.investmentContributionRate >= 10) {
    return 'Move from building to optimizing. Review your cash target, account mix, tax buckets, and asset allocation so the money you already have is working as efficiently as your habits.';
  }

  if (signals.housePoorRisk && metrics.fixedCostPressureRatio >= 60) {
    return 'Review housing, utilities, and fixed obligations together before making smaller spending cuts elsewhere.';
  }

  if (biggestOpportunity === 'protection') {
    return 'Review the protection checklist and close the single coverage gap that could create the biggest setback.';
  }

  if (biggestOpportunity === 'investing') {
    return 'Increase consistency before adding complexity. Confirm your contribution rate, account mix, and next 90-day target.';
  }

  return `Choose one concrete action to improve ${biggestOpportunity} over the next 30 days.`;
}

function buildStructuralWarnings(metrics: V2FinancialMetrics, signals: V2Signals): V2Report['structuralWarnings'] {
  const warnings: V2Report['structuralWarnings'] = [];

  if (signals.housePoorRisk) {
    warnings.push({
      type: 'housing_pressure',
      severity: signals.veryHighHousingBurden ? 'high' : 'medium',
      message: `Housing may be crowding out progress. Your housing cost is about ${round(
        metrics.housingRatio
      )}% of take-home pay.`,
    });
  }

  if (signals.veryHighFixedCostPressure) {
    warnings.push({
      type: 'structural_pressure',
      severity: 'high',
      message: `Fixed costs are about ${round(
        metrics.fixedCostPressureRatio
      )}% of take-home pay, which can make progress difficult even with good habits.`,
    });
  }

  if (signals.excessCashLikely) {
    warnings.push({
      type: 'excess_cash',
      severity: 'medium',
      message:
        'Your cash reserve appears to be stronger than most emergency fund targets. Some excess cash may be underutilized.',
    });
  }

  if (signals.dependentsWithoutLifeInsurance) {
    warnings.push({
      type: 'protection_gap',
      severity: 'high',
      message:
        'You indicated dependents but no life insurance. That is a meaningful protection gap.',
    });
  }

  if (signals.incompleteNetWorthData) {
    warnings.push({
      type: 'net_worth_data_gap',
      severity: 'medium',
      message:
        'Net worth may be incomplete because investment, property, or liability balances were not included.',
    });
  }

  return warnings;
}

function buildActionPlan(biggestOpportunity: BuildingBlockKey, nextStep: string) {
  return {
    immediate: [
      {
        title: `Start with ${biggestOpportunity}`,
        body: nextStep,
        checklist: [
          'Choose one specific action you can complete this week.',
          'Make the first move small enough to repeat.',
          'Review the result before adding more complexity.',
        ],
      },
    ],
    shortTerm: [
      {
        title: 'Next 30 days',
        body: 'Turn the first action into a simple repeatable system.',
        checklist: [
          'Pick one number to track.',
          'Schedule a weekly check-in.',
          'Adjust only after you have real feedback.',
        ],
      },
    ],
    longTerm: [
      {
        title: 'Next 90 days',
        body: 'Use the next 90 days to strengthen the foundation and then reassess.',
        checklist: [
          'Retake the assessment after meaningful changes.',
          'Compare the score and pillar movement.',
          'Move to the next weakest area once momentum is visible.',
        ],
      },
    ],
  };
}

export function generateV2Report(
  answers: Record<string, any>,
  assessmentType: AssessmentType = 'detailed'
): V2Report {
  const metrics = buildV2FinancialMetrics(answers);
  const signals = deriveV2Signals(answers, metrics);
  const buildingBlockScores = calculateV2BuildingBlockScores(answers);
  const pillarScores = { ...buildingBlockScores };
  const foundationScore = calculateV2FoundationScore(pillarScores);
  const biggestOpportunity = getV2BiggestOpportunity(buildingBlockScores, signals);
  const lifeStage = determineV2LifeStage(answers, metrics);
  const insights = buildV2Insights(answers, metrics, signals, biggestOpportunity);
  const priorities = buildPriorities(buildingBlockScores, biggestOpportunity, signals);
  const nextStep = buildNextStep(biggestOpportunity, metrics, signals);

  return {
    foundationScore,
    scoreBand: getScoreBand(foundationScore),
    buildingBlockScores,
    pillarScores,
    biggestOpportunity,
    lifeStage,
    insights,
    priorities,
    summary: buildSummary(foundationScore, biggestOpportunity, metrics),
    nextStep,
    metrics,
    signals,
    structuralWarnings: buildStructuralWarnings(metrics, signals),
    actionPlan: buildActionPlan(biggestOpportunity, nextStep),
  };
}

export async function loadAssessmentsFromSupabase() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;

    if (!userId) return [];

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load error:', error);
      return [];
    }

    return (data ?? []).map((item) => ({
      id: item.id,
      userId: item.user_id,
      assessmentType: item.assessment_type,
      overallScore: item.overall_score,
      createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
      updatedAt: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
      buildingBlockScores: item.building_block_scores ?? {},
      pillarScores: item.pillar_scores ?? {},
      lifeStage: item.life_stage,
      insights: item.insights ?? [],
      priorities: item.priorities ?? [],
      milestonesCompleted: item.milestones_completed ?? [],
      nextMilestones: item.next_milestones ?? [],
      summary: item.summary,
      nextStep: item.next_step,
      answers: item.answers ?? item.report?.answers,
      report: item.report,
    }));
  } catch (err) {
    console.error('Assessment load failed:', err);
    return [];
  }
}
