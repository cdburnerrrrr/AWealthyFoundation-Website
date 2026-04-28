import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: {
    netWorth: number;
    netWorthBenchmark: number;
    savingsRate: number;
    savingsBenchmark: number;
    fixedCosts: number;
    fixedBenchmark: number;
  };
};

export default function ComparisonModal({ isOpen, onClose, data }: Props) {
  if (!isOpen) return null;

  const Row = ({ label, value, benchmark }: any) => {
    const max = Math.max(value, benchmark);
    const userWidth = (value / max) * 100;
    const benchWidth = (benchmark / max) * 100;

    return (
      <div className="mb-6">
        <div className="flex justify-between text-sm text-white/70 mb-1">
          <span>{label}</span>
          <span>
            You: {value.toLocaleString()} | Avg: {benchmark.toLocaleString()}
          </span>
        </div>

        <div className="space-y-1">
          <div className="h-3 bg-[#0f2a44] rounded">
            <div
              className="h-3 bg-copper-500 rounded"
              style={{ width: `${userWidth}%` }}
            />
          </div>

          <div className="h-3 bg-[#0f2a44] rounded">
            <div
              className="h-3 bg-navy-400 rounded"
              style={{ width: `${benchWidth}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-[#0f2a44] rounded-2xl p-6 w-full max-w-xl shadow-xl border border-white/10">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">
            How You Compare (Detailed)
          </h2>
          <button onClick={onClose}>
            <X className="text-white/60" />
          </button>
        </div>

        <Row
          label="Net Worth"
          value={data.netWorth}
          benchmark={data.netWorthBenchmark}
        />

        <Row
          label="Savings Rate (%)"
          value={data.savingsRate}
          benchmark={data.savingsBenchmark}
        />

        <Row
          label="Fixed Costs (%)"
          value={data.fixedCosts}
          benchmark={data.fixedBenchmark}
        />

        <p className="text-xs text-white/50 mt-4">
          Benchmarks are broad U.S. household estimates. Your situation may vary.
        </p>
      </div>
    </div>
  );
}