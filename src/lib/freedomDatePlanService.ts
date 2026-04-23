import { client } from '../api/client';
import type { DebtInput } from './freedomDateEngine';

export type FreedomDateScenario = {
  debts: DebtInput[];
  priority: 'balance' | 'interest';
  mode: 'payment' | 'time';
  extraPayment: number;
  targetMonths: number;
  results: {
    freedomDate: string;
    monthsToFreedom: number;
    monthsSaved: number;
    interestSaved: number;
  } | null;
  remindMonthly: boolean;
  updatedAt: string;
};

export type FreedomDatePlanRecord = {
  id: string;
  user_id: string;
  scenario_json: FreedomDateScenario;
  priority: 'balance' | 'interest';
  mode: 'payment' | 'time';
  extra_payment: number;
  target_months: number;
  remind_monthly: boolean;
  last_freedom_date: string | null;
  updated_at: string;
  created_at: string;
};

export async function loadFreedomDatePlan(userId: string) {
  const { data, error } = await client
    .from('freedom_date_plans')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as FreedomDatePlanRecord | null) ?? null;
}

export async function saveFreedomDatePlan(userId: string, scenario: FreedomDateScenario) {
  const payload = {
    user_id: userId,
    scenario_json: scenario,
    priority: scenario.priority,
    mode: scenario.mode,
    extra_payment: scenario.extraPayment,
    target_months: scenario.targetMonths,
    remind_monthly: scenario.remindMonthly,
    last_freedom_date: scenario.results?.freedomDate
      ? scenario.results.freedomDate.slice(0, 10)
      : null,
  };

  const { data, error } = await client
    .from('freedom_date_plans')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) throw error;
  return data as FreedomDatePlanRecord;
}
