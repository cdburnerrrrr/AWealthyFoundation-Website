import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { calculateEmergencyFund } from '../lib/emergencyFundEngine';

export default function EmergencyFundTargetTool() {
  const [expanded, setExpanded] = useState(false);

  const [inputs, setInputs] = useState({
    monthlyExpenses: 3000,
    currentSavings: 2000,
    incomeStability: 'stable',
    dependents: 'none',
    housing: 'rent',
  });

  const result = calculateEmergencyFund(inputs);

  const update = (key: string, value: any) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-5">

      {/* INPUTS */}
      <section>
        <h3 className="text-lg font-semibold text-[#0f2a44]">
          1. Monthly Needs
        </h3>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            type="number"
            value={inputs.monthlyExpenses}
            onChange={(e) => update('monthlyExpenses', Number(e.target.value))}
            placeholder="Monthly Expenses"
            className="input"
          />

          <input
            type="number"
            value={inputs.currentSavings}
            onChange={(e) => update('currentSavings', Number(e.target.value))}
            placeholder="Current Savings"
            className="input"
          />

          <select
            value={inputs.incomeStability}
            onChange={(e) => update('incomeStability', e.target.value)}
            className="input"
          >
            <option value="stable">Stable Income</option>
            <option value="variable">Variable Income</option>
            <option value="uncertain">Uncertain Income</option>
          </select>
        </div>
      </section>

      {/* PROFILE */}
      <section>
        <h3 className="text-lg font-semibold text-[#0f2a44]">
          2. Your Situation
        </h3>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select
            value={inputs.dependents}
            onChange={(e) => update('dependents', e.target.value)}
            className="input"
          >
            <option value="none">No Dependents</option>
            <option value="some">Some Dependents</option>
            <option value="many">Many Dependents</option>
          </select>

          <select
            value={inputs.housing}
            onChange={(e) => update('housing', e.target.value)}
            className="input"
          >
            <option value="rent">Rent</option>
            <option value="own">Own Home</option>
            <option value="own_high_maintenance">Own (High Maintenance)</option>
          </select>
        </div>
      </section>

      {/* RESULT */}
      <section>
        <h3 className="text-lg font-semibold text-[#0f2a44]">
          3. Your Target
        </h3>

        <div className="mt-3 rounded-2xl bg-[#b8742a]/10 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#8a5a24]/80">
  Your Emergency Fund Target
</p>

<p className="text-3xl font-semibold text-[#6d4318] mt-1">
  ${result.minTarget.toLocaleString()} – ${result.maxTarget.toLocaleString()}
</p>

<p className="mt-3 text-sm text-[#8a5a24]">
  You have ${inputs.currentSavings.toLocaleString()} saved
</p>

<p className="mt-1 text-sm text-[#8a5a24]">
  You need ${result.gapMin.toLocaleString()} – ${result.gapMax.toLocaleString()} more
</p>

<p className="mt-3 text-sm text-[#5a7690]">
  This covers about {(inputs.currentSavings / inputs.monthlyExpenses).toFixed(1)} months of expenses
</p>

<p className="mt-1 text-sm text-[#5a7690]">
  Target: {result.minMonths}–{result.maxMonths} months
</p>

<p className="mt-3 text-xs text-[#5a7690]">
  This is your financial buffer — not your spending account.
</p>
        </div>
      </section>

      {/* DETAILS (COLLAPSED) */}
      <section className="rounded-2xl bg-white/70 ring-1 ring-[#2b5676]/6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <span className="text-sm font-medium text-[#0f2a44]">
            Details & Guidelines
          </span>
          <ChevronDown
            className={`transition ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {expanded && (
          <div className="px-4 pb-4 text-sm text-[#5a7690] space-y-3">

            <p>
              An emergency fund is for protecting your household from disruption — not for buying something because it was on sale.
            </p>

            <div>
              <p className="font-semibold">Real Emergencies</p>
              <ul className="list-disc ml-5">
                <li>Job loss</li>
                <li>Medical costs</li>
                <li>Car repairs</li>
                <li>Home repairs</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">Not Emergencies</p>
              <ul className="list-disc ml-5">
                <li>Vacations</li>
                <li>Sales or deals</li>
                <li>Handbags, boats, ATVs</li>
                <li>Holiday spending</li>
              </ul>
            </div>

          </div>
        )}
      </section>

    </div>
  );
}