import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MyFreedomDateTool from '../components/MyFreedomDateTool';

export default function MyFreedomDatePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#d8ecf8] text-[#0f2a44]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#eef8ff_0%,#d8ecf8_40%,#c6e2f2_100%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.26]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a33_1px,transparent_1px),linear-gradient(to_bottom,#0f3a5a33_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a22_1px,transparent_1px),linear-gradient(to_bottom,#0f3a5a22_1px,transparent_1px)] bg-[size:140px_140px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_1px_1px,#0f3a5a_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.2]">
        <div className="absolute top-24 left-[10%] h-64 w-64 rounded-full border border-[#0f3a5a]/28" />
        <div className="absolute bottom-20 right-[12%] h-48 w-48 rounded-full border border-[#0f3a5a]/24" />
        <div className="absolute top-16 left-[25%] w-72 border-t border-dashed border-[#0f3a5a]/26" />
        <div className="absolute bottom-24 right-[25%] w-56 border-t border-dashed border-[#0f3a5a]/24" />
      </div>

      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#b8742a]/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-96 w-96 rounded-full bg-sky-400/8 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/foundation-tools"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8a5a24] transition hover:text-[#6d4318]"
        >
          <ArrowLeft size={16} />
          <span>Back to Foundation Tools</span>
        </Link>

        <div className="mb-6 max-w-3xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#b8742a]/82">
            Debt Tools
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[#0f2a44] sm:text-5xl">
            My Freedom Date
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#325672]">
            Enter your debts, adjust your plan, and see when you could be debt-free.
          </p>
        </div>

        <div className="relative rounded-[32px] border border-[#0f3a5a]/14 bg-white/32 p-2.5 shadow-[0_18px_52px_rgba(15,58,90,0.10)] backdrop-blur-[2px]">
          <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/34" />
          <div className="pointer-events-none absolute inset-[10px] rounded-[25px] border border-[#0f3a5a]/8" />

          <div className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l border-t border-[#0f3a5a]/22" />
          <div className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r border-t border-[#0f3a5a]/22" />
          <div className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 border-b border-l border-[#0f3a5a]/22" />
          <div className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b border-r border-[#0f3a5a]/22" />

          <div className="pointer-events-none absolute inset-0 rounded-[32px] opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,#0f3a5a_1px,transparent_0)] [background-size:18px_18px]" />

          <div className="relative rounded-[26px] bg-white/54 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] ring-1 ring-[#0f3a5a]/8">
            <MyFreedomDateTool />
          </div>
        </div>
      </div>
    </div>
  );
}
