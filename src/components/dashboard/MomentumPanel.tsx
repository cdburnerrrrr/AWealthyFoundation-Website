import { ArrowRight, Flame, Target, TrendingUp } from 'lucide-react';
import { MomentumAction, getMomentumSummary } from '../../lib/momentumEngine';

type MomentumPanelProps = {
  actions: MomentumAction[];
  onNextMove?: () => void;
};

export default function MomentumPanel({ actions, onNextMove }: MomentumPanelProps) {
  const summary = getMomentumSummary(actions);

  return (
    <section className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#0f2742] via-[#12375c] to-[#071827] p-6 text-white shadow-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-100">
            <TrendingUp className="h-3.5 w-3.5" />
            Momentum Engine
          </div>

          <div>
            <h2 className="text-2xl font-bold">{summary.headline}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
              {summary.message}
            </p>
          </div>

          {summary.nextAction && (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                Today’s Next Best Move
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {summary.nextAction.title}
              </p>
            </div>
          )}
        </div>

        <div className="grid min-w-[260px] grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Target className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                This Week
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">
              {summary.weeklyCompleted}/{summary.weeklyTotal}
            </p>
            <p className="text-xs text-slate-300">actions completed</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Streak
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{summary.streakDays}</p>
            <p className="text-xs text-slate-300">days in motion</p>
          </div>

          <div className="col-span-2 rounded-2xl bg-white/10 p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
              <span>Weekly progress</span>
              <span>{summary.progressPercent}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#c8964e] transition-all duration-500"
                style={{ width: `${summary.progressPercent}%` }}
              />
            </div>
          </div>

          {summary.nextAction && (
            <button
              type="button"
              onClick={onNextMove}
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c8964e] px-4 py-3 text-sm font-bold text-[#071827] transition hover:bg-[#d8aa64]"
            >
              Do Today’s Move
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}