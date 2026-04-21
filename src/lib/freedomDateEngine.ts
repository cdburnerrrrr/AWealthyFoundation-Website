export type PayoffPriority = 'balance' | 'interest';

export type DebtType =
  | 'credit_card'
  | 'auto'
  | 'student'
  | 'personal'
  | 'other';

export type DebtInput = {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment?: number;
  type?: DebtType;
};

export type NormalizedDebt = {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
  type: DebtType;
};

export type PayoffSettings = {
  priority: PayoffPriority;
  extraPayment: number;
};

export type MonthlySnapshot = {
  monthIndex: number;
  totalBalance: number;
  totalInterestPaid: number;
  totalPayment: number;
  remainingDebts: number;
};

export type DebtPayoffEvent = {
  debtId: string;
  debtName: string;
  payoffMonth: number;
};

export type PayoffResult = {
  monthsToFreedom: number;
  freedomDate: Date;
  totalInterestPaid: number;
  totalPaid: number;
  payoffOrder: DebtPayoffEvent[];
  timeline: MonthlySnapshot[];
  isComplete: boolean;
  warning?: string;
};

const DEFAULT_MIN_PAYMENT_FLOOR = 25;
const DEFAULT_MIN_PAYMENT_RATE = 0.02;
const MAX_SIMULATION_MONTHS = 600;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clampNonNegative(n: number): number {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function estimateMinimumPayment(balance: number): number {
  return round2(
    Math.max(balance * DEFAULT_MIN_PAYMENT_RATE, DEFAULT_MIN_PAYMENT_FLOOR)
  );
}

export function normalizeDebt(input: DebtInput): NormalizedDebt {
  const balance = clampNonNegative(input.balance);
  const apr = clampNonNegative(input.apr);

  const minPayment =
    input.minPayment && input.minPayment > 0
      ? round2(input.minPayment)
      : estimateMinimumPayment(balance);

  return {
    id: input.id,
    name: input.name?.trim() || 'Debt',
    balance: round2(balance),
    apr: round2(apr),
    minPayment,
    type: input.type ?? 'other',
  };
}

function sortDebts(
  debts: NormalizedDebt[],
  priority: PayoffPriority
): NormalizedDebt[] {
  const openDebts = debts.filter((d) => d.balance > 0);

  if (priority === 'balance') {
    return [...openDebts].sort((a, b) => {
      if (a.balance !== b.balance) return a.balance - b.balance;
      if (a.apr !== b.apr) return b.apr - a.apr;
      return a.name.localeCompare(b.name);
    });
  }

  return [...openDebts].sort((a, b) => {
    if (a.apr !== b.apr) return b.apr - a.apr;
    if (a.balance !== b.balance) return a.balance - b.balance;
    return a.name.localeCompare(b.name);
  });
}

export function getAttackOrder(
  debtInputs: DebtInput[],
  priority: PayoffPriority
) {
  return debtInputs
    .map(normalizeDebt)
    .filter((d) => d.balance > 0)
    .sort((a, b) => {
      if (priority === 'balance') {
        if (a.balance !== b.balance) return a.balance - b.balance;
        if (a.apr !== b.apr) return b.apr - a.apr;
        return a.name.localeCompare(b.name);
      }

      if (a.apr !== b.apr) return b.apr - a.apr;
      if (a.balance !== b.balance) return a.balance - b.balance;
      return a.name.localeCompare(b.name);
    })
    .map((d) => ({
      debtId: d.id,
      debtName: d.name,
    }));
}

function addMonths(date: Date, months: number): Date {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

export function simulateFreedomDate(
  debtInputs: DebtInput[],
  settings: PayoffSettings,
  startDate = new Date()
): PayoffResult {
  const debts = debtInputs
    .map(normalizeDebt)
    .filter((d) => d.balance > 0);

  if (debts.length === 0) {
    return {
      monthsToFreedom: 0,
      freedomDate: new Date(startDate),
      totalInterestPaid: 0,
      totalPaid: 0,
      payoffOrder: [],
      timeline: [],
      isComplete: true,
    };
  }

  let monthIndex = 0;
  let totalInterestPaid = 0;
  let totalPaid = 0;
  const payoffOrder: DebtPayoffEvent[] = [];
  const timeline: MonthlySnapshot[] = [];

  while (monthIndex < MAX_SIMULATION_MONTHS) {
    const openDebts = debts.filter((d) => d.balance > 0);
    if (openDebts.length === 0) break;

    let paymentThisMonth = 0;

    for (const debt of openDebts) {
      const monthlyRate = debt.apr / 100 / 12;
      const interest = round2(debt.balance * monthlyRate);
      debt.balance = round2(debt.balance + interest);
      totalInterestPaid = round2(totalInterestPaid + interest);
    }

    for (const debt of debts.filter((d) => d.balance > 0)) {
      const minPayment = Math.min(debt.minPayment, debt.balance);
      debt.balance = round2(debt.balance - minPayment);
      paymentThisMonth = round2(paymentThisMonth + minPayment);
    }

    let extraPool = round2(clampNonNegative(settings.extraPayment));

    while (extraPool > 0.009) {
      const targets = sortDebts(debts, settings.priority);
      if (targets.length === 0) break;

      const target = targets[0];
      const payment = Math.min(extraPool, target.balance);

      target.balance = round2(target.balance - payment);
      extraPool = round2(extraPool - payment);
      paymentThisMonth = round2(paymentThisMonth + payment);
    }

    totalPaid = round2(totalPaid + paymentThisMonth);

    for (const debt of debts) {
      if (
        debt.balance <= 0 &&
        !payoffOrder.some((event) => event.debtId === debt.id)
      ) {
        debt.balance = 0;
        payoffOrder.push({
          debtId: debt.id,
          debtName: debt.name,
          payoffMonth: monthIndex + 1,
        });
      }
    }

    const totalBalance = round2(
      debts.reduce((sum, debt) => sum + debt.balance, 0)
    );

    timeline.push({
      monthIndex: monthIndex + 1,
      totalBalance,
      totalInterestPaid,
      totalPayment: paymentThisMonth,
      remainingDebts: debts.filter((d) => d.balance > 0).length,
    });

    monthIndex++;
  }

  const isComplete = debts.every((d) => d.balance <= 0);
  const freedomDate = addMonths(startDate, monthIndex);

  return {
    monthsToFreedom: monthIndex,
    freedomDate,
    totalInterestPaid,
    totalPaid,
    payoffOrder,
    timeline,
    isComplete,
    warning: isComplete
      ? undefined
      : 'Your current payment level may be too low to pay off all debts within the modeled timeframe.',
  };
}

export function solveExtraPaymentForTargetMonths(
  debtInputs: DebtInput[],
  priority: PayoffPriority,
  targetMonths: number,
  startDate = new Date()
): number {
  const safeTargetMonths = Math.max(1, Math.floor(targetMonths));

  const baseline = simulateFreedomDate(
    debtInputs,
    { priority, extraPayment: 0 },
    startDate
  );

  if (baseline.monthsToFreedom <= safeTargetMonths && baseline.isComplete) {
    return 0;
  }

  let low = 0;
  let high = 10000;

  for (let i = 0; i < 12; i++) {
    const test = simulateFreedomDate(
      debtInputs,
      { priority, extraPayment: high },
      startDate
    );

    if (test.isComplete && test.monthsToFreedom <= safeTargetMonths) {
      break;
    }

    high *= 2;
  }

  for (let i = 0; i < 32; i++) {
    const mid = (low + high) / 2;

    const result = simulateFreedomDate(
      debtInputs,
      { priority, extraPayment: mid },
      startDate
    );

    if (!result.isComplete || result.monthsToFreedom > safeTargetMonths) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return round2(high);
}

export function buildBaselineVsPlan(
  debtInputs: DebtInput[],
  priority: PayoffPriority,
  extraPayment: number,
  startDate = new Date()
) {
  const baseline = simulateFreedomDate(
    debtInputs,
    {
      priority,
      extraPayment: 0,
    },
    startDate
  );

  const plan = simulateFreedomDate(
    debtInputs,
    {
      priority,
      extraPayment,
    },
    startDate
  );

  return {
    baseline,
    plan,
    monthsSaved: Math.max(0, baseline.monthsToFreedom - plan.monthsToFreedom),
    interestSaved: round2(
      Math.max(0, baseline.totalInterestPaid - plan.totalInterestPaid)
    ),
  };
}
