import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  CreditCard,
  Gauge,
  Lightbulb,
  PiggyBank,
  Shield,
  Wallet,
} from 'lucide-react';

type AreaId =
  | 'vision'
  | 'protection'
  | 'investing'
  | 'spending'
  | 'income'
  | 'saving'
  | 'debt';

type Area = {
  id: AreaId;
  label: string;
  icon: ReactNode;
  position: string;
};

const areas: Area[] = [
  {
    id: 'vision',
    label: 'Vision',
    icon: <Lightbulb className="h-6 w-6" strokeWidth={1.7} />,
    position: 'col-start-1 row-start-1 mt-12',
  },
  {
    id: 'protection',
    label: 'Protection',
    icon: <Shield className="h-6 w-6" strokeWidth={1.7} />,
    position: 'col-start-2 row-start-1',
  },
  {
    id: 'investing',
    label: 'Investing',
    icon: <ArrowUpRight className="h-6 w-6" strokeWidth={1.7} />,
    position: 'col-start-3 row-start-1 mt-12',
  },
  {
    id: 'spending',
    label: 'Spending',
    icon: <CreditCard className="h-6 w-6" strokeWidth={1.7} />,
    position: 'col-start-1 row-start-2 -mt-2',
  },
  {
    id: 'income',
    label: 'Income',
    icon: <Wallet className="h-6 w-6" strokeWidth={1.7} />,
    position: 'col-start-2 row-start-2 -mt-10',
  },
  {
    id: 'saving',
    label: 'Saving',
    icon: <PiggyBank className="h-6 w-6" strokeWidth={1.7} />,
    position: 'col-start-3 row-start-2 -mt-2',
  },
  {
    id: 'debt',
    label: 'Debt',
    icon: <CreditCard className="h-6 w-6" strokeWidth={1.7} />,
    position: 'col-start-2 row-start-3 -mt-12',
  },
];

function PuzzleTab({ side }: { side: 'top' | 'right' | 'bottom' | 'left' }) {
  const positions = {
    top: '-top-3 left-1/2 -translate-x-1/2',
    right: 'right-[-12px] top-1/2 -translate-y-1/2',
    bottom: '-bottom-3 left-1/2 -translate-x-1/2',
    left: 'left-[-12px] top-1/2 -translate-y-1/2',
  };

  return (
    <span
      aria-hidden="true"
      className={`absolute h-7 w-7 rounded-full border border-[#d7cfc3] bg-[#fbf8f2] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ${positions[side]}`}
    />
  );
}

export default function FoundationPuzzle() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % areas.length);
    }, 1250);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  const activeId = useMemo(() => areas[activeIndex]?.id, [activeIndex]);

  return (
    <div className="w-full max-w-[620px]">
      <div className="relative rounded-[34px] border border-slate-200/80 bg-[radial-gradient(circle_at_40%_42%,rgba(212,161,92,0.12),transparent_34%),linear-gradient(180deg,#fffdf9_0%,#f7f4ee_100%)] px-4 py-7 shadow-[0_24px_70px_rgba(15,42,68,0.09)] sm:px-7 sm:py-9">
        <div className="grid grid-cols-[1fr_1fr_1fr] grid-rows-[128px_128px_112px] gap-x-1 sm:grid-rows-[144px_144px_122px] sm:gap-x-2">
          {areas.map((area, index) => {
            const active = area.id === activeId;

            return (
              <motion.div
                key={area.id}
                className={`relative z-10 flex min-h-[112px] flex-col items-center justify-center rounded-[24px] border px-2 text-center ${area.position}`}
                animate={
                  active
                    ? {
                        y: -4,
                        scale: 1.03,
                        borderColor: 'rgba(212,161,92,0.95)',
                        boxShadow:
                          '0 16px 34px rgba(184,115,51,0.20), 0 0 0 2px rgba(212,161,92,0.28), 0 0 28px rgba(212,161,92,0.32)',
                      }
                    : {
                        y: 0,
                        scale: 1,
                        borderColor: 'rgba(215,207,195,0.95)',
                        boxShadow:
                          '0 8px 22px rgba(15,42,68,0.07), inset 0 1px 0 rgba(255,255,255,0.92)',
                      }
                }
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{ background: active ? '#fffaf0' : '#fbf8f2' }}
              >
                <PuzzleTab side="top" />
                <PuzzleTab side="right" />
                <PuzzleTab side="bottom" />
                <PuzzleTab side="left" />

                <div className={`relative z-10 ${active ? 'text-[#b87333]' : 'text-[#8a8f94]'}`}>
                  {active ? area.icon : <span className="text-3xl font-light">?</span>}
                </div>
                <div
                  className={`relative z-10 mt-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] sm:text-xs ${
                    active ? 'text-navy-900' : 'text-slate-400'
                  }`}
                >
                  {active ? area.label : 'Hidden'}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col items-center justify-center gap-4 sm:mt-0 sm:flex-row sm:items-end">
          <div className="rounded-2xl border border-copper-300/70 bg-white/80 px-4 py-2 text-center text-xs font-medium text-navy-600 shadow-sm">
            Revealing one piece at a time
          </div>

          <div className="relative w-[185px] rotate-2 rounded-[28px] border-2 border-copper-500 bg-navy-900 px-5 py-6 text-center text-white shadow-[0_18px_38px_rgba(15,42,68,0.23)] sm:ml-5">
            <span className="absolute -top-3 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full border-2 border-copper-500 bg-navy-900" />
            <span className="absolute -right-3 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-2 border-copper-500 bg-navy-900" />
            <Gauge className="mx-auto h-8 w-8 text-white" strokeWidth={1.7} />
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.14em]">Credit Score</p>
            <p className="mt-2 text-xs leading-5 text-copper-300">The one you already know.</p>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center font-serif text-lg font-semibold leading-7 text-navy-900 sm:text-xl">
        Your credit score is one piece.
        <span className="block text-copper-600">Your Foundation Score shows the full picture.</span>
      </p>
    </div>
  );
}
