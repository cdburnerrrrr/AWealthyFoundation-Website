import { useMemo } from 'react';
import { buildBaselineVsPlan } from '../lib/freedomDateEngine';
import { useFreedomDatePlanner } from '../hooks/useFreedomDatePlanner';

export default function MyFreedomDateTool() {
  const {
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
    setExtraPayment,
    setTargetMonths,
  } = useFreedomDatePlanner();

  const strategyImpact = useMemo(() => {
    if (validDebts.length === 0) return null;

    const balancePlan = buildBaselineVsPlan(validDebts, 'balance', effectiveExtraPayment);
    const interestPlan = buildBaselineVsPlan(validDebts, 'interest', effectiveExtraPayment);

    const sameOrder =
      JSON.stringify(balancePlan.plan.payoffOrder.map((d) => d.debtId)) ===
      JSON.stringify(interestPlan.plan.payoffOrder.map((d) => d.debtId));

    const sameMonths =
      balancePlan.plan.monthsToFreedom === interestPlan.plan.monthsToFreedom;

    const sameInterest =
      Math.abs(balancePlan.plan.totalInterestPaid - interestPlan.plan.totalInterestPaid) < 0.01;

    if (sameOrder && sameMonths && sameInterest) {
      return {
        label: 'Minimal',
        text: 'Both strategies lead to nearly the same result at this payment level.',
      };
    }

    return {
      label: 'Significant',
      text: 'Your strategy meaningfully changes the payoff path at this payment level.',
    };
  }, [validDebts, effectiveExtraPayment]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {state.debts.map((debt, index) => (
          <div
            key={debt.id}
            className="rounded-2xl border border-[#2b5676]/20 bg-white/78 p-4"
          >
            {index === 0 && (
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#b8742a]">
                Debt Details
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5a7690]">
                  Debt Name
                </label>
                <input
                  type="text"
                  value={debt.name}
                  onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                  placeholder="Visa"
                  className="w-full rounded-xl border border-[#2b5676]/20 bg-white/90 px-3 py-2 text-sm text-[#153b58]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5a7690]">
                  Balance
                </label>
                <input
                  type="number"
                  value={debt.balance}
                  onChange={(e) =>
                    updateDebt(debt.id, 'balance', Number(e.target.value) || 0)
                  }
                  placeholder="1200"
                  className="w-full rounded-xl border border-[#2b5676]/20 bg-white/90 px-3 py-2 text-sm text-[#153b58]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5a7690]">
                  Interest Rate
                </label>
                <input
                  type="number"
                  value={debt.apr}
                  onChange={(e) =>
                    updateDebt(debt.id, 'apr', Number(e.target.value) || 0)
                  }
                  placeholder="24.99"
                  className="w-full rounded-xl border border-[#2b5676]/20 bg-white/90 px-3 py-2 text-sm text-[#153b58]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5a7690]">
                  Minimum Payment
                </label>
                <input
                  type="number"
                  value={debt.minPayment ?? ''}
                  onChange={(e) =>
                    updateDebt(
                      debt.id,
                      'minPayment',
                      e.target.value === '' ? undefined : Number(e.target.value) || 0
                    )
                  }
                  placeholder="optional"
                  className="w-full rounded-xl border border-[#2b5676]/20 bg-white/90 px-3 py-2 text-sm text-[#153b58]"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-[#5a7690]">
                Leave minimum payment blank to use an estimate.
              </p>
              <button
                type="button"
                onClick={() => removeDebt(debt.id)}
                className="text-sm font-semibold text-[#8a5a24] hover:text-[#6d4318]"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {results?.plan.warning && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {results.plan.warning}
          </div>
        )}

        <button
          type="button"
          onClick={addDebt}
          className="rounded-full border border-[#0f3a5a]/20 bg-white/80 px-4 py-2 text-sm font-semibold text-[#0f2a44] hover:bg-white"
        >
          Add Another Debt
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-[#2b5676]/20 bg-white/85 p-5">
          <h3 className="text-lg font-semibold text-[#0f2a44]">
            Projected Debt Finish Order
          </h3>
          <p className="mt-1 text-xs text-[#5a7690]">
            This shows the order debts are expected to reach zero. It can differ from your first target depending on balances, minimums, and payment level.
          </p>

          {results ? (
            <div className="mt-4 space-y-3">
              {results.plan.payoffOrder.map((item, index) => (
                <div
                  key={item.debtId}
                  className="flex items-center justify-between rounded-xl border border-[#2b5676]/12 bg-white/70 px-4 py-3"
                >
                  <p className="font-medium text-[#153b58]">
                    {index + 1}. {item.debtName}
                  </p>
                  <p className="text-sm font-semibold text-[#8a5a24]">
                    {item.payoffMonth} months
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#5a7690]">
              Add at least one debt to project your payoff order.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#2b5676]/20 bg-white/85 p-5">
            <h3 className="text-lg font-semibold text-[#0f2a44]">
              Payoff Priority
            </h3>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPriority('balance')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  state.priority === 'balance'
                    ? 'bg-[#0f3a5a] text-white'
                    : 'border border-[#0f3a5a]/20 bg-white/80 text-[#0f2a44]'
                }`}
              >
                Prioritize by Balance
              </button>

              <button
                type="button"
                onClick={() => setPriority('interest')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  state.priority === 'interest'
                    ? 'bg-[#0f3a5a] text-white'
                    : 'border border-[#0f3a5a]/20 bg-white/80 text-[#0f2a44]'
                }`}
              >
                Prioritize by Interest Rate
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#2b5676]/20 bg-white/70 p-4">
                <p className="text-sm font-medium text-[#153b58]">Current first target</p>
                <p className="mt-1 text-lg font-semibold text-[#0f2a44]">
                  {attackOrder[0]?.debtName ?? '—'}
                </p>
              </div>

              <div className="rounded-xl border border-[#2b5676]/20 bg-white/70 p-4">
                <p className="text-sm font-medium text-[#153b58]">Strategy impact</p>
                <p className="mt-1 text-lg font-semibold text-[#0f2a44]">
                  {strategyImpact?.label ?? '—'}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-[#5a7690]">
              Priority affects where your extra payment goes first. If extra payment is $0, both strategies will behave the same.
            </p>

            {strategyImpact && (
              <p className="mt-2 text-xs text-[#5a7690]">{strategyImpact.text}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#2b5676]/20 bg-white/78 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-[#153b58]">
              Extra Payment
            </span>
            <span className="text-sm font-semibold text-[#b8742a]">
              ${Math.round(
                state.mode === 'payment' ? state.extraPayment : effectiveExtraPayment
              )}/mo
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={3000}
            step={25}
            value={
              state.mode === 'payment' ? state.extraPayment : effectiveExtraPayment
            }
            onChange={(e) => setExtraPayment(Number(e.target.value))}
            className="w-full"
          />

          <p className="mt-2 text-xs text-[#5a7690]">
            Move this to see how much faster you could be debt-free.
          </p>
        </div>

        <div className="rounded-2xl border border-[#2b5676]/20 bg-white/78 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-[#153b58]">
              Target Payoff Time
            </span>
            <span className="text-sm font-semibold text-[#b8742a]">
              {state.mode === 'time' ? state.targetMonths : derivedTargetMonths} months
            </span>
          </div>

          <input
            type="range"
            min={6}
            max={120}
            step={1}
            value={
              state.mode === 'time' ? state.targetMonths : derivedTargetMonths
            }
            onChange={(e) => setTargetMonths(Number(e.target.value))}
            className="w-full"
          />

          <p className="mt-2 text-xs text-[#5a7690]">
            Move this earlier to see the monthly payment needed to reach that freedom date.
          </p>
        </div>
      </div>

      {results && (
        <div className="rounded-2xl border border-[#2b5676]/20 bg-white/85 p-5">
          <h3 className="text-lg font-semibold text-[#0f2a44]">
            Freedom Timeline
          </h3>

          {(() => {
            const baselineMonths = Math.max(results.baseline.monthsToFreedom, 1);
            const planMonths = Math.max(results.plan.monthsToFreedom, 1);

            const progress = 1 - planMonths / baselineMonths;
            const clamped = Math.max(0, Math.min(progress, 1));

            const leftPercent = `${(1 - clamped) * 100}%`;
            const dotSize = 14 + clamped * 18;

            return (
              <div className="mt-6">
                <div className="relative h-12">
                  <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#c6ddeb]" />

                  <div
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#b8742a] shadow-[0_0_18px_rgba(184,116,42,0.35)] transition-all duration-300"
                    style={{
                      left: leftPercent,
                      width: `${dotSize}px`,
                      height: `${dotSize}px`,
                    }}
                  />

                  <div className="absolute left-0 top-full mt-2 text-xs text-[#5a7690]">
                    Soon
                  </div>
                  <div className="absolute right-0 top-full mt-2 text-xs text-[#5a7690]">
                    Later
                  </div>
                </div>

                <p className="mt-6 text-sm text-[#325672]">
                  The closer your Freedom Date moves to the left, the bigger the target gets.
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {results && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#2b5676]/20 bg-white/85 p-5">
            <p className="text-sm text-[#5a7690]">Baseline Freedom Date</p>
            <p className="mt-1 text-xl font-semibold text-[#0f2a44]">
              {results.baseline.freedomDate.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="rounded-2xl border border-[#b8742a]/18 bg-[#b8742a]/10 p-5">
            <p className="text-sm text-[#7a4e1d]">Your Freedom Date</p>
            <p className="mt-1 text-xl font-semibold text-[#6d4318]">
              {results.plan.freedomDate.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="rounded-2xl border border-[#2b5676]/20 bg-white/85 p-5">
            <p className="text-sm text-[#5a7690]">Months Saved</p>
            <p className="mt-1 text-xl font-semibold text-[#0f2a44]">
              {results.monthsSaved}
            </p>
          </div>

          <div className="rounded-2xl border border-[#2b5676]/20 bg-white/85 p-5">
            <p className="text-sm text-[#5a7690]">Interest Saved</p>
            <p className="mt-1 text-xl font-semibold text-[#0f2a44]">
              ${results.interestSaved.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
