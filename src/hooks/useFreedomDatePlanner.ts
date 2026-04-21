import { useMemo, useState } from 'react';
import {
  DebtInput,
  PayoffPriority,
  buildBaselineVsPlan,
  solveExtraPaymentForTargetMonths,
  getAttackOrder,
} from '../lib/freedomDateEngine';

type FreedomMode = 'payment' | 'time';

type FreedomDateUiState = {
  debts: DebtInput[];
  priority: PayoffPriority;
  mode: FreedomMode;
  extraPayment: number;
  targetMonths: number;
};

function createEmptyDebt(): DebtInput {
  return {
    id: crypto.randomUUID(),
    name: '',
    balance: 0,
    apr: 0,
    minPayment: undefined,
    type: 'other',
  };
}

const DEFAULT_STATE: FreedomDateUiState = {
  debts: [createEmptyDebt()],
  priority: 'interest',
  mode: 'payment',
  extraPayment: 0,
  targetMonths: 36,
};

export function useFreedomDatePlanner() {
  const [state, setState] = useState<FreedomDateUiState>(DEFAULT_STATE);

  const validDebts = useMemo(() => {
    return state.debts.filter(
      (d) =>
        d.name.trim() ||
        Number(d.balance) > 0 ||
        Number(d.apr) > 0 ||
        Number(d.minPayment ?? 0) > 0
    );
  }, [state.debts]);

  const effectiveExtraPayment = useMemo(() => {
    if (validDebts.length === 0) return 0;

    if (state.mode === 'payment') {
      return state.extraPayment;
    }

    return solveExtraPaymentForTargetMonths(
      validDebts,
      state.priority,
      state.targetMonths
    );
  }, [validDebts, state.mode, state.extraPayment, state.priority, state.targetMonths]);

  const results = useMemo(() => {
    if (validDebts.length === 0) return null;

    return buildBaselineVsPlan(
      validDebts,
      state.priority,
      effectiveExtraPayment
    );
  }, [validDebts, state.priority, effectiveExtraPayment]);

  const attackOrder = useMemo(() => {
    if (validDebts.length === 0) return [];
    return getAttackOrder(validDebts, state.priority);
  }, [validDebts, state.priority]);

  const derivedTargetMonths = results?.plan.monthsToFreedom ?? state.targetMonths;

  const addDebt = () => {
    setState((prev) => ({
      ...prev,
      debts: [...prev.debts, createEmptyDebt()],
    }));
  };

  const removeDebt = (id: string) => {
    setState((prev) => {
      const nextDebts = prev.debts.filter((d) => d.id !== id);
      return {
        ...prev,
        debts: nextDebts.length > 0 ? nextDebts : [createEmptyDebt()],
      };
    });
  };

  const updateDebt = <K extends keyof DebtInput>(
    id: string,
    key: K,
    value: DebtInput[K]
  ) => {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.map((debt) =>
        debt.id === id ? { ...debt, [key]: value } : debt
      ),
    }));
  };

  const setPriority = (priority: PayoffPriority) => {
    setState((prev) => ({ ...prev, priority }));
  };

  const setMode = (mode: FreedomMode) => {
    setState((prev) => ({ ...prev, mode }));
  };

  const setExtraPayment = (extraPayment: number) => {
    setState((prev) => ({
      ...prev,
      mode: 'payment',
      extraPayment: Math.max(0, extraPayment),
    }));
  };

  const setTargetMonths = (targetMonths: number) => {
    setState((prev) => ({
      ...prev,
      mode: 'time',
      targetMonths: Math.max(1, Math.floor(targetMonths)),
    }));
  };

  return {
    state,
    validDebts,
    results,
    effectiveExtraPayment,
    derivedTargetMonths,
    attackOrder,
    addDebt,
    removeDebt,
    updateDebt,
    setPriority,
    setMode,
    setExtraPayment,
    setTargetMonths,
  };
}
