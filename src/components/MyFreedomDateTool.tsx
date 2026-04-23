import { useMemo, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
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
    saveState,
    addDebt,
    removeDebt,
    updateDebt,
    setPriority,
    setExtraPayment,
    setTargetMonths,
    setRemindMonthly,
  } = useFreedomDatePlanner();

  const [strategyExpanded, setStrategyExpanded] = useState(false);

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
        text: 'Both strategies land in nearly the same place at this payment level.',
      };
    }

    return {
      label: 'Meaningful',
      text: 'Your strategy changes the payoff path in a noticeable way.',
    };
  }, [validDebts, effectiveExtraPayment]);

  const saveBadgeText =
    saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="min-h-[20px] text-[#6f8aa3]">
          {state.restoredAt
            ? `Plan restored • ${new Date(state.restoredAt).toLocaleDateString()}`
            : ''}
        </div>

        {saveBadgeText ? (
          <div className="rounded-full border border-[#2b5676]/12 bg-white/72 px-2.5 py-1 text-[11px] font-medium text-[#6f8aa3] shadow-sm transition-opacity duration-300">
            {saveBadgeText}
          </div>
        ) : (
          <div />
        )}
      </div>

      <section className="space-y-2.5">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">1. Add your debts</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">Enter each balance, rate, and payment.</p>
        </div>

        <div className="rounded-2xl border border-[#2b5676]/14 bg-white/62 p-3">
          <div className="hidden items-end gap-3 border-b border-[#2b5676]/10 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f8aa3] md:grid md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
            <span>Debt Name</span>
            <span>Balance</span>
            <span>Interest Rate</span>
            <div>
              <span>Minimum Payment</span>
              <p className="mt-1 text-[10px] font-medium tracking-[0.04em] normal-case text-[#7c95ab]">
                Leave Blank For Estimate
              </p>
            </div>
            <span className="text-right">&nbsp;</span>
          </div>

          <div className="space-y-2.5 pt-0 md:pt-2.5">
            {state.debts.map((debt, index) => (
              <div
                key={debt.id}
                className="rounded-xl bg-white/76 p-2.5 ring-1 ring-[#2b5676]/10"
              >
                {index === 0 && (
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7c95ab] md:hidden">
                    Leave Blank For Estimate
                  </p>
                )}

                <div className="grid gap-2.5 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto] md:items-center">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f8aa3] md:hidden">
                      Debt Name
                    </label>
                    <input
                      type="text"
                      value={debt.name}
                      onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                      placeholder="Visa"
                      className="w-full rounded-lg border border-[#2b5676]/14 bg-white/92 px-3 py-2 text-sm text-[#153b58] outline-none transition focus:border-[#2b5676]/24"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f8aa3] md:hidden">
                      Balance
                    </label>
                    <input
                      type="number"
                      value={debt.balance}
                      onChange={(e) =>
                        updateDebt(debt.id, 'balance', Number(e.target.value) || 0)
                      }
                      placeholder="1200"
                      className="w-full rounded-lg border border-[#2b5676]/14 bg-white/92 px-3 py-2 text-sm text-[#153b58] outline-none transition focus:border-[#2b5676]/24"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f8aa3] md:hidden">
                      Interest Rate
                    </label>
                    <input
                      type="number"
                      value={debt.apr}
                      onChange={(e) => updateDebt(debt.id, 'apr', Number(e.target.value) || 0)}
                      placeholder="24.99"
                      className="w-full rounded-lg border border-[#2b5676]/14 bg-white/92 px-3 py-2 text-sm text-[#153b58] outline-none transition focus:border-[#2b5676]/24"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f8aa3] md:hidden">
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
                      className="w-full rounded-lg border border-[#2b5676]/14 bg-white/92 px-3 py-2 text-sm text-[#153b58] outline-none transition focus:border-[#2b5676]/24"
                    />
                  </div>

                  <div className="flex justify-end md:pt-4">
                    <button
                      type="button"
                      onClick={() => removeDebt(debt.id)}
                      className="text-sm font-medium text-[#8a5a24]/90 transition hover:text-[#6d4318]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {results?.plan.warning && (
          <div className="rounded-xl border border-rose-200/90 bg-rose-50/85 px-3 py-2.5 text-sm text-rose-700">
            {results.plan.warning}
          </div>
        )}

        <button
          type="button"
          onClick={addDebt}
          className="inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1.5 text-sm font-medium text-[#0f2a44] ring-1 ring-[#0f3a5a]/14 transition hover:bg-white/80"
        >
          <Plus size={15} />
          Add debt
        </button>
      </section>

      <section className="space-y-2.5">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">2. Adjust your plan</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">Change payment or time to compare your options.</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl bg-white/78 p-3.5 ring-1 ring-[#2b5676]/12">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[#153b58]">Extra Payment</span>
              <span className="text-sm font-semibold text-[#b8742a]">
                ${Math.round(
                  state.mode === 'payment' ? state.extraPayment : effectiveExtraPayment
                )}
                /mo
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={3000}
              step={25}
              value={state.mode === 'payment' ? state.extraPayment : effectiveExtraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="rounded-2xl bg-white/78 p-3.5 ring-1 ring-[#2b5676]/12">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[#153b58]">Target Payoff Time</span>
              <span className="text-sm font-semibold text-[#b8742a]">
                {state.mode === 'time' ? state.targetMonths : derivedTargetMonths} months
              </span>
            </div>

            <input
              type="range"
              min={6}
              max={120}
              step={1}
              value={state.mode === 'time' ? state.targetMonths : derivedTargetMonths}
              onChange={(e) => setTargetMonths(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </section>

      <section className="space-y-2.5">
        <div>
          <h3 className="text-lg font-semibold text-[#0f2a44]">3. Strategy</h3>
          <p className="mt-1 text-sm text-[#6f8aa3]">
            Usually a smaller decision. Open this only if you want the details.
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 ring-1 ring-[#2b5676]/12">
          <button
            type="button"
            onClick={() => setStrategyExpanded((value) => !value)}
            className="flex w-full items-center justify-between gap-4 px-3.5 py-3.5 text-left"
          >
            <div className="grid flex-1 gap-2.5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7c95ab]">
                  Priority
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0f2a44]">
                  {state.priority === 'balance' ? 'Balance' : 'Interest Rate'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7c95ab]">
                  First Target
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0f2a44]">
                  {attackOrder[0]?.debtName ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7c95ab]">
                  Impact
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0f2a44]">
                  {strategyImpact?.label ?? '—'}
                </p>
              </div>
            </div>

            <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-white/80 ring-1 ring-[#2b5676]/10 text-[#5a7690]">
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${strategyExpanded ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {strategyExpanded && (
            <div className="border-t border-[#2b5676]/10 px-3.5 pb-3.5 pt-3">
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setPriority('balance')}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    state.priority === 'balance'
                      ? 'bg-[#0f3a5a] text-white'
                      : 'bg-white/78 text-[#0f2a44] ring-1 ring-[#0f3a5a]/14'
                  }`}
                >
                  Balance
                </button>

                <button
                  type="button"
                  onClick={() => setPriority('interest')}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    state.priority === 'interest'
                      ? 'bg-[#0f3a5a] text-white'
                      : 'bg-white/78 text-[#0f2a44] ring-1 ring-[#0f3a5a]/14'
                  }`}
                >
                  Interest Rate
                </button>
              </div>

              {strategyImpact && (
                <p className="mt-3 text-sm text-[#6f8aa3]">{strategyImpact.text}</p>
              )}

              <div className="mt-3 rounded-xl bg-white/55 p-3 ring-1 ring-[#2b5676]/10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7c95ab]">
                  Projected Finish Order
                </p>

                {results ? (
                  <div className="mt-2.5 space-y-2">
                    {results.plan.payoffOrder.map((item, index) => (
                      <div
                        key={item.debtId}
                        className="flex items-center justify-between rounded-lg bg-white/78 px-3 py-2 ring-1 ring-[#2b5676]/8"
                      >
                        <p className="text-sm font-medium text-[#153b58]">
                          {index + 1}. {item.debtName}
                        </p>
                        <p className="text-sm font-semibold text-[#8a5a24]">
                          {item.payoffMonth} mo
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2.5 text-sm text-[#6f8aa3]">
                    Add at least one debt to project your payoff order.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {results && (
        <section className="space-y-2.5">
          <div>
            <h3 className="text-lg font-semibold text-[#0f2a44]">4. Your Freedom Plan</h3>
            <p className="mt-1 text-sm text-[#6f8aa3]">See where this plan lands and what it saves.</p>
          </div>

          <div className="rounded-2xl bg-white/84 p-4 ring-1 ring-[#2b5676]/12 sm:p-4.5">
            {(() => {
              const baselineMonths = Math.max(results.baseline.monthsToFreedom, 1);
              const planMonths = Math.max(results.plan.monthsToFreedom, 1);

              const progress = 1 - planMonths / baselineMonths;
              const clamped = Math.max(0, Math.min(progress, 1));

              const leftPercent = `${(1 - clamped) * 100}%`;
              const dotSize = 14 + clamped * 18;

              return (
                <div>
                  <div className="relative h-11">
                    <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#c6ddeb]" />

                    <div
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#b8742a] shadow-[0_0_18px_rgba(184,116,42,0.28)] transition-all duration-300"
                      style={{
                        left: leftPercent,
                        width: `${dotSize}px`,
                        height: `${dotSize}px`,
                      }}
                    />

                    <div className="absolute left-0 top-full mt-2 text-[11px] text-[#7c95ab]">
                      Soon
                    </div>
                    <div className="absolute right-0 top-full mt-2 text-[11px] text-[#7c95ab]">
                      Later
                    </div>
                  </div>

                  <div className="mt-7 grid gap-3 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                    <div className="rounded-2xl bg-[#b8742a]/8 p-4 ring-1 ring-[#b8742a]/14">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a5a24]">
                        Your Freedom Date
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[#6d4318] sm:text-[2rem]">
                        {results.plan.freedomDate.toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="mt-2 text-sm text-[#8a5a24]/85">
                        Baseline {results.baseline.freedomDate.toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/72 p-3.5 ring-1 ring-[#2b5676]/10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7c95ab]">
                          Months Saved
                        </p>
                        <p className="mt-1.5 text-xl font-semibold text-[#0f2a44] sm:text-2xl">
                          {results.monthsSaved}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/72 p-3.5 ring-1 ring-[#2b5676]/10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7c95ab]">
                          Interest Saved
                        </p>
                        <p className="mt-1.5 text-xl font-semibold text-[#0f2a44] sm:text-2xl">
                          ${results.interestSaved.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      <div className="rounded-2xl bg-white/78 p-3.5 ring-1 ring-[#2b5676]/12">
        <label className="flex items-start gap-3 text-sm text-[#153b58]">
          <input
            type="checkbox"
            checked={state.remindMonthly}
            onChange={(e) => setRemindMonthly(e.target.checked)}
            className="mt-1"
          />
          <span>Remind me monthly to check back in and update my Freedom Date</span>
        </label>
      </div>
    </div>
  );
}
