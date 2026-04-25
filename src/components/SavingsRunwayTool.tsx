import { useState } from 'react';
import { calculateRunway } from '../lib/savingsRunwayEngine';

export default function SavingsRunwayTool() {
  const [savings, setSavings] = useState(5000);
  const [expenses, setExpenses] = useState(3000);

  const months = calculateRunway(savings, expenses);

  return (
    <div className="space-y-5">

      <section>
        <h3 className="text-lg font-semibold text-[#0f2a44]">
          Your Current Position
        </h3>

        <div className="grid gap-3 md:grid-cols-2 mt-3">
          <input
            type="number"
            value={savings}
            onChange={(e) => setSavings(Number(e.target.value))}
            placeholder="Total Savings"
            className="input"
          />

          <input
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(Number(e.target.value))}
            placeholder="Monthly Expenses"
            className="input"
          />
        </div>
      </section>

      <section>
        <div className="rounded-2xl bg-[#b8742a]/10 p-5">
          <p className="text-xs uppercase text-[#8a5a24]/80">
            Your Runway
          </p>

          <p className="text-3xl font-semibold text-[#6d4318] mt-1">
            {months.toFixed(1)} months
          </p>

          <p className="mt-2 text-sm text-[#5a7690]">
            If income stopped today, this is how long your savings would last.
          </p>
        </div>
      </section>

    </div>
  );
}