import { useState } from 'react';
import { calculateRunway } from '../lib/savingsRunwayEngine';

export default function SavingsRunwayTool() {
  const [savings, setSavings] = useState(5000);
  const [expenses, setExpenses] = useState(3000);

  const months = calculateRunway(savings, expenses);
  const years = months / 12;

  return (
    <div className="space-y-5">

      <section>
        <h3 className="text-lg font-semibold text-[#0f2a44]">
          Your Savings Position
        </h3>

        <div className="grid gap-4 md:grid-cols-2 mt-4">

  {/* Savings */}
  <div>
    <label className="block text-sm font-medium text-[#325672] mb-1">
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

  {/* Expenses */}
  <div>
    <label className="block text-sm font-medium text-[#325672] mb-1">
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

          <p className="text-4xl font-semibold text-[#6d4318] mt-1">
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