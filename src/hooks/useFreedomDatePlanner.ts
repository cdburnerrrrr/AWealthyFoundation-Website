import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DebtInput,
  PayoffPriority,
  buildBaselineVsPlan,
  solveExtraPaymentForTargetMonths,
  getAttackOrder,
} from '../lib/freedomDateEngine';
import {
  loadFreedomDatePlan,
  saveFreedomDatePlan,
  type FreedomDateScenario,
} from '../lib/freedomDatePlanService';
import { useAppStore } from '../store/appStore';

type FreedomMode = 'payment' | 'time';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

type FreedomDateUiState = {
  debts: DebtInput[];
  priority: PayoffPriority;
  mode: FreedomMode;
  extraPayment: number;
  targetMonths: number;
  remindMonthly: boolean;
  restoredAt: string | null;
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
  remindMonthly: false,
  restoredAt: null,
};

export function useFreedomDatePlanner() {
  const { user, isAuthenticated } = useAppStore();
  const userId = (user as any)?.id || (user as any)?.user_id || null;

  const [state, setState] = useState<FreedomDateUiState>(DEFAULT_STATE);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const hasLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (state.mode === 'payment') return state.extraPayment;

    return solveExtraPaymentForTargetMonths(
      validDebts,
      state.priority,
      state.targetMonths
    );
  }, [validDebts, state.mode, state.extraPayment, state.priority, state.targetMonths]);

  const results = useMemo(() => {
    if (validDebts.length === 0) return null;
    return buildBaselineVsPlan(validDebts, state.priority, effectiveExtraPayment);
  }, [validDebts, state.priority, effectiveExtraPayment]);

  const attackOrder = useMemo(() => {
    if (validDebts.length === 0) return [];
    return getAttackOrder(validDebts, state.priority);
  }, [JSON.stringify(validDebts), state.priority]);

  const derivedTargetMonths = results?.plan.monthsToFreedom ?? state.targetMonths;

  useEffect(() => {
    if (!isAuthenticated || !userId || hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    setLoadState('loading');

    loadFreedomDatePlan(userId)
      .then((record) => {
        if (!record?.scenario_json) {
          setLoadState('loaded');
          return;
        }

        const scenario = record.scenario_json;
        setState({
          debts: scenario.debts?.length ? scenario.debts : [createEmptyDebt()],
          priority: scenario.priority,
          mode: scenario.mode,
          extraPayment: scenario.extraPayment,
          targetMonths: scenario.targetMonths,
          remindMonthly: scenario.remindMonthly,
          restoredAt: record.updated_at,
        });
        setLoadState('loaded');
      })
      .catch(() => setLoadState('error'));
  }, [isAuthenticated, userId]);

  const scenario = useMemo<FreedomDateScenario | null>(() => {
    if (!isAuthenticated || !userId) return null;

    return {
      debts: state.debts,
      priority: state.priority,
      mode: state.mode,
      extraPayment: state.extraPayment,
      targetMonths: state.targetMonths,
      remindMonthly: state.remindMonthly,
      results: results
        ? {
            freedomDate: results.plan.freedomDate.toISOString(),
            monthsToFreedom: results.plan.monthsToFreedom,
            monthsSaved: results.monthsSaved,
            interestSaved: results.interestSaved,
          }
        : null,
      updatedAt: new Date().toISOString(),
    };
  }, [isAuthenticated, userId, state, results]);

  useEffect(() => {
    if (!scenario || !userId || loadState === 'loading') return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveState('saving');

    console.log('Saving Freedom Plan:', {
      isAuthenticated,
      userId,
    });

    saveTimeoutRef.current = setTimeout(() => {
      saveFreedomDatePlan(userId, scenario)
        .then((record) => {
          setSaveState('saved');
          setState((prev) => ({ ...prev, restoredAt: record.updated_at }));
          window.setTimeout(() => setSaveState('idle'), 1500);
        })
        .catch(() => setSaveState('error'));
    }, 700);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [scenario, userId, loadState, isAuthenticated]);

  const addDebt = () => {
    setState((prev) => ({ ...prev, debts: [...prev.debts, createEmptyDebt()] }));
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

  const updateDebt = <K extends keyof DebtInput>(id: string, key: K, value: DebtInput[K]) => {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.map((debt) => (debt.id === id ? { ...debt, [key]: value } : debt)),
    }));
  };

  const setPriority = (priority: PayoffPriority) => setState((prev) => ({ ...prev, priority }));
  const setExtraPayment = (extraPayment: number) =>
    setState((prev) => ({ ...prev, mode: 'payment', extraPayment: Math.max(0, extraPayment) }));
  const setTargetMonths = (targetMonths: number) =>
    setState((prev) => ({ ...prev, mode: 'time', targetMonths: Math.max(1, Math.floor(targetMonths)) }));
  const setRemindMonthly = (remindMonthly: boolean) =>
    setState((prev) => ({ ...prev, remindMonthly }));

  return {
    state,
    validDebts,
    results,
    effectiveExtraPayment,
    derivedTargetMonths,
    attackOrder,
    saveState,
    loadState,
    addDebt,
    removeDebt,
    updateDebt,
    setPriority,
    setExtraPayment,
    setTargetMonths,
    setRemindMonthly,
  };
}
