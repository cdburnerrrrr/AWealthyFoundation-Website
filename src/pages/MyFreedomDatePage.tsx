import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MyFreedomDateTool from '../components/MyFreedomDateTool';

export default function MyFreedomDatePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#d8ecf8] text-[#0f2a44]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#eef8ff_0%,#d8ecf8_40%,#c6e2f2_100%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a33_1px,transparent_1px),linear-gradient(to_bottom,#0f3a5a33_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.2]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a22_1px,transparent_1px),linear-gradient(to_bottom,#0f3a5a22_1px,transparent_1px)] bg-[size:140px_140px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.25] [background-image:radial-gradient(circle_at_1px_1px,#0f3a5a_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.3]">
        <div className="absolute top-24 left-[10%] h-64 w-64 rounded-full border border-[#0f3a5a]/35" />
        <div className="absolute bottom-20 right-[12%] h-48 w-48 rounded-full border border-[#0f3a5a]/30" />
        <div className="absolute top-32 right-[18%] h-40 w-40 rounded-tl-full border-l border-t border-[#0f3a5a]/35" />
        <div className="absolute bottom-32 left-[15%] h-32 w-32 rounded-br-full border-b border-r border-[#0f3a5a]/35" />
        <div className="absolute top-16 left-[25%] w-72 border-t border-dashed border-[#0f3a5a]/35" />
        <div className="absolute bottom-24 right-[25%] w-56 border-t border-dashed border-[#0f3a5a]/35" />
        <div className="absolute left-[20%] top-[50%] h-12 w-12">
          <div className="absolute left-0 top-1/2 h-px w-full bg-[#0f3a5a]/40" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-[#0f3a5a]/40" />
        </div>
      </div>

      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#b8742a]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/foundation-tools"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8a5a24] transition hover:text-[#6d4318]"
        >
          <ArrowLeft size={16} />
          <span>Back to Foundation Tools</span>
        </Link>

        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#b8742a]/85">
            Debt Tools
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[#0f2a44] sm:text-5xl">
            My Freedom Date
          </h1>
          <p className="mt-4 text-base leading-7 text-[#325672]">
            Enter your debts, adjust your plan, and see when you could be debt-free.
            Use the sliders to balance speed against breathing room in your budget.
          </p>
        </div>

        <div className="relative rounded-[34px] border border-[#0f3a5a]/18 bg-white/35 p-3 shadow-[0_20px_60px_rgba(15,58,90,0.12)] backdrop-blur-[2px]">
          <div className="pointer-events-none absolute inset-0 rounded-[34px] border border-white/40" />
          <div className="pointer-events-none absolute inset-[10px] rounded-[26px] border border-[#0f3a5a]/12" />

          <div className="pointer-events-none absolute left-4 top-4 h-6 w-6 border-l border-t border-[#0f3a5a]/30" />
          <div className="pointer-events-none absolute right-4 top-4 h-6 w-6 border-r border-t border-[#0f3a5a]/30" />
          <div className="pointer-events-none absolute bottom-4 left-4 h-6 w-6 border-b border-l border-[#0f3a5a]/30" />
          <div className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 border-b border-r border-[#0f3a5a]/30" />

          <div className="pointer-events-none absolute inset-0 rounded-[34px] opacity-[0.18] [background-image:radial-gradient(circle_at_1px_1px,#0f3a5a_1px,transparent_0)] [background-size:18px_18px]" />

          <div className="pointer-events-none absolute left-10 right-10 top-0 border-t border-dashed border-[#0f3a5a]/18" />
          <div className="pointer-events-none absolute bottom-0 left-16 right-16 border-t border-dashed border-[#0f3a5a]/14" />

          <div className="pointer-events-none absolute left-10 top-10 h-28 w-28 rounded-full bg-[#b8742a]/8 blur-2xl" />
          <div className="pointer-events-none absolute bottom-10 right-10 h-28 w-28 rounded-full bg-sky-400/8 blur-2xl" />

          <div className="relative rounded-[28px] border border-[#0f3a5a]/10 bg-white/55 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
            <MyFreedomDateTool />
          </div>
        </div>
      </div>
    </div>
  );
}