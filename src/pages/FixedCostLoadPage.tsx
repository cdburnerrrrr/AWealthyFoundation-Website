import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FixedCostLoadTool from '../components/FixedCostLoadTool';

export default function FixedCostLoadPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#081a2d] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#143a5c_0%,#0a2138_42%,#081a2d_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#cfe8ff1f_1px,transparent_1px),linear-gradient(to_bottom,#cfe8ff1f_1px,transparent_1px)] bg-[size:36px_36px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,rgba(207,232,255,0.42)_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Link
          to="/foundation-tools"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-copper-200 transition hover:text-copper-100"
        >
          <ArrowLeft size={16} />
          <span>Back to Foundation Tools</span>
        </Link>

        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-copper-200/80">
            Spending Tools
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Fixed Cost Load
          </h1>
          <p className="mt-4 text-base leading-7 text-white/72">
            This tool helps you see how much of your monthly take-home pay is already committed to the costs that hit first.
          </p>
        </div>

        <FixedCostLoadTool />
      </div>
    </div>
  );
}
