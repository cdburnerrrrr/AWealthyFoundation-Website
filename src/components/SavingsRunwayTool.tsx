import { useState } from 'react';
import { calculateRunway } from '../lib/savingsRunwayEngine';
import { useAppStore } from '../store/appStore';

export default function SavingsRunwayTool() {
  const { currentAssessment } = useAppStore();

  const metrics = (currentAssessment as any)?.metrics ?? {};

  const initialSavings = metrics.totalSavings ?? 0;

  const initialExpenses =
    metrics.monthlyFixedCosts ??
    (metrics.monthlyHousingCost ?? 0) +
      (metrics.monthlyUtilities ?? 0) +
      (metrics.monthlyChildcareCost ?? 0) +
      (metrics.monthlyDebtPayments ?? 0);

  const [savings, setSavings] = useState(initialSavings);
  const [expenses, setExpenses] = useState(initialExpenses);

  const months = calculateRunway(savings, expenses);
  const years = months / 12;

  return (
    <div className="space-y-5">
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[#0f2a44]">
          Your Savings Position
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#325672]">
              Total Savings
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a7690]">
                $
              </span>
              <input
                type="number"
                value={savings}
                onChange={(e) => setSavings(Number(e.target.value))}
                placeholder="0"
                className="input pl-7"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#325672]">
              Monthly Expenses
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a7690]">
                $
              </span>
              <input
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(Number(e.target.value))}
                placeholder="0"
                className="input pl-7"
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="rounded-2xl bg-[#b8742a]/12 p-5">
          <p className="text-xs uppercase text-[#8a5a24]/80">
            Your Runway
          </p>

          <p className="mt-1 text-4xl font-semibold text-[#6d4318]">
            {months.toFixed(1)} months
          </p>

          <p className="mt-1 text-sm text-[#8a5a24]">
            ≈ {years.toFixed(1)} years
          </p>

          <p className="mt-2 text-sm text-[#5a7690]">
            If your income stopped today, this is how long your savings would cover your lifestyle.
          </p>

          <p className="mt-3 text-sm text-[#5a7690]">
            {months < 1 &&
              'Your cushion is very thin — even a short disruption could create stress.'}
            {months >= 1 &&
              months < 3 &&
              'You have some buffer, but a longer disruption would still be difficult.'}
            {months >= 3 &&
              months < 6 &&
              'You’re in a solid position, but strengthening your cushion would add security.'}
            {months >= 6 && 'You have a strong financial buffer in place.'}
          </p>
        </div>
      </section>
    </div>
  );
}
