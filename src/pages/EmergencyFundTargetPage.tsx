// src/pages/EmergencyFundTargetPage.tsx

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EmergencyFundTargetTool from '../components/EmergencyFundTargetTool';

export default function EmergencyFundTargetPage() {
  return (
    <div className="min-h-screen bg-[#d8ecf8] text-[#0f2a44]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link
          to="/foundation-tools"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8a5a24]"
        >
          <ArrowLeft size={16} />
          Back to Foundation Tools
        </Link>

        <div className="mb-6 max-w-3xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#b8742a]/82">
            Saving Tools
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Emergency Fund Target
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#325672]">
            Find the right cash cushion for your household.
          </p>
        </div>

        <div className="rounded-[26px] bg-white/54 p-2 ring-1 ring-[#0f3a5a]/8">
          <EmergencyFundTargetTool />
        </div>
      </div>
    </div>
  );
}