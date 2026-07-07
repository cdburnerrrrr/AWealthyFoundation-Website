import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Gauge } from 'lucide-react';

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
  x: number;
  y: number;
};

const areas: Area[] = [
  { id: 'vision', label: 'Vision', x: 18, y: 26 },
  { id: 'protection', label: 'Protection', x: 126, y: 0 },
  { id: 'investing', label: 'Investing', x: 234, y: 26 },
  { id: 'spending', label: 'Spending', x: 18, y: 134 },
  { id: 'income', label: 'Income', x: 126, y: 108 },
  { id: 'saving', label: 'Saving', x: 234, y: 134 },
  { id: 'debt', label: 'Debt', x: 126, y: 216 },
];

/*
  A true jigsaw-piece outline with four interlocking sides.
  Each piece is 126 × 126 and overlaps its neighbors slightly,
  which makes the seven pieces read as one connected puzzle.
*/
const PIECE_PATH = [
  'M 18 0',
  'H 47',
  'C 47 16, 79 16, 79 0',
  'H 108',
  'Q 126 0, 126 18',
  'V 47',
  'C 110 47, 110 79, 126 79',
  'V 108',
  'Q 126 126, 108 126',
  'H 79',
  'C 79 110, 47 110, 47 126',
  'H 18',
  'Q 0 126, 0 108',
  'V 79',
  'C 16 79, 16 47, 0 47',
  'V 18',
  'Q 0 0, 18 0',
  'Z',
].join(' ');

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
    <div className="w-full max-w-[650px]">
      <div className="relative overflow-hidden rounded-[34px] border border-slate-200/80 bg-[radial-gradient(circle_at_42%_42%,rgba(212,161,92,0.12),transparent_36%),linear-gradient(180deg,#fffdf9_0%,#f7f4ee_100%)] px-3 py-5 shadow-[0_24px_70px_rgba(15,42,68,0.09)] sm:px-6 sm:py-7">
        <div className="grid items-center gap-3 lg:grid-cols-[1fr_180px] lg:gap-5">
          <div className="relative mx-auto w-full max-w-[430px]">
            <svg
              viewBox="0 0 378 342"
              role="img"
              aria-label="Seven connected puzzle pieces representing the seven areas of the Foundation Score"
              className="block h-auto w-full overflow-visible"
            >
              <defs>
                <filter id="pieceShadow" x="-30%" y="-30%" width="160%" height="170%">
                  <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#0f2a44" floodOpacity="0.10" />
                </filter>
                <filter id="activeGlow" x="-45%" y="-45%" width="190%" height="190%">
                  <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#b87333" floodOpacity="0.22" />
                  <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#d4a15c" floodOpacity="0.48" />
                </filter>
                <linearGradient id="pieceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fffdf8" />
                  <stop offset="100%" stopColor="#f7f2e9" />
                </linearGradient>
                <linearGradient id="activeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fffaf0" />
                  <stop offset="100%" stopColor="#fff4df" />
                </linearGradient>
              </defs>

              {areas.map((area) => {
                const active = area.id === activeId;
                const centerX = area.x + 63;
                const centerY = area.y + 63;

                return (
                  <motion.g
                    key={area.id}
                    animate={{ y: active ? -3 : 0, scale: active ? 1.025 : 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                  >
                    <path
                      d={PIECE_PATH}
                      transform={`translate(${area.x} ${area.y})`}
                      fill={active ? 'url(#activeFill)' : 'url(#pieceFill)'}
                      stroke={active ? '#d4a15c' : '#d8cfc2'}
                      strokeWidth={active ? 2.4 : 1.35}
                      filter={active ? 'url(#activeGlow)' : 'url(#pieceShadow)'}
                    />

                    <text
                      x={centerX}
                      y={centerY - 6}
                      textAnchor="middle"
                      fontFamily="Georgia, serif"
                      fontSize={active ? 24 : 25}
                      fill={active ? '#b87333' : '#9aa0a6'}
                    >
                      {active ? '•' : '?'}
                    </text>

                    <text
                      x={centerX}
                      y={centerY + 18}
                      textAnchor="middle"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                      fontWeight="700"
                      fontSize="10.5"
                      letterSpacing="1.7"
                      fill={active ? '#18314f' : '#a7aab0'}
                    >
                      {active ? area.label.toUpperCase() : 'HIDDEN'}
                    </text>
                  </motion.g>
                );
              })}
            </svg>

            <div className="mx-auto -mt-1 w-fit rounded-full border border-copper-300/70 bg-white/85 px-4 py-2 text-center text-xs font-medium text-navy-600 shadow-sm">
              Revealing one piece at a time
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-[168px] rotate-2 text-center">
              <svg viewBox="0 0 160 160" className="h-auto w-full overflow-visible" aria-hidden="true">
                <defs>
                  <filter id="creditShadow" x="-35%" y="-35%" width="170%" height="180%">
                    <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#0f2a44" floodOpacity="0.24" />
                  </filter>
                </defs>
                <path
                  d={PIECE_PATH}
                  transform="translate(17 17) scale(1.0)"
                  fill="#0f2f4f"
                  stroke="#c77a2b"
                  strokeWidth="2"
                  filter="url(#creditShadow)"
                />
              </svg>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-7 pt-1 text-white">
                <Gauge className="h-8 w-8" strokeWidth={1.7} />
                <p className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.13em]">Credit Score</p>
                <p className="mt-2 text-[0.65rem] leading-4 text-copper-300">The one you already know.</p>
              </div>
            </div>
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
