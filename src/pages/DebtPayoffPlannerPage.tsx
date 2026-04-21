import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DebtPayoffPlannerTool from '../components/DebtPayoffPlannerTool';

export default function DebtPayoffPlannerPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#d8ecf8] text-[#0f2a44]">

      {/* Blueprint background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#eef8ff_0%,#d8ecf8_40%,#c6e2f2_100%)]" />

      <div className="absolute inset-0 opacity-[0.35]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a33_1px,transparent_1px),linear-gradient(to_bottom,#0f3a5a33_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">

        <Link
          to="/foundation-tools"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8a5a24]"
        >
          <ArrowLeft size={16} />
          Back to Tools
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-semibold">Debt Payoff Planner</h1>
          <p className="text-[#325672] mt-2">
            See how extra payments accelerate your payoff and reduce interest.
          </p>
        </div>

        {/* Blueprint panel frame */}
        <div className="relative rounded-[34px] border border-[#0f3a5a]/18 bg-white/35 p-3 shadow-lg">

          <div className="absolute inset-0 rounded-[34px] border border-white/40 pointer-events-none" />
          <div className="absolute inset-[10px] rounded-[26px] border border-[#0f3a5a]/12 pointer-events-none" />

          <div className="relative rounded-[28px] bg-white/60 p-4">
            <DebtPayoffPlannerTool />
          </div>
        </div>

      </div>
    </div>
  );
}