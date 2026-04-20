import FixedCostLoadTool from '../components/FixedCostLoadTool';
import MonthlyMarginPlannerTool from '../components/MonthlyMarginPlannerTool';

export default function FoundationToolsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 text-white">
      
      {/* Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Blueprint Overlay Lines (subtle) */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('/blueprint-lines.svg')] bg-cover bg-center" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif text-copper-500 mb-4">
            Foundation Tools
          </h1>
          <p className="text-lg text-navy-200 max-w-2xl mx-auto">
            Interactive tools designed to strengthen every part of your financial foundation.
          </p>
        </div>

        {/* ========================= */}
        {/* SPENDING TOOLS SECTION */}
        {/* ========================= */}
        <section className="mb-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Spending Tools
            </h2>
            <p className="text-navy-200 max-w-xl mx-auto">
              Understand how much of your income is already committed—and how much flexibility you really have.
            </p>
          </div>

          <div className="space-y-8">
            <FixedCostLoadTool />
            <MonthlyMarginPlannerTool />
          </div>
        </section> {/* 👈 THIS WAS MISSING */}

        {/* Future sections go here */}
        {/*
        <section>Debt Tools</section>
        <section>Saving Tools</section>
        <section>Investing Tools</section>
        */}

      </div>
    </div>
  );
}