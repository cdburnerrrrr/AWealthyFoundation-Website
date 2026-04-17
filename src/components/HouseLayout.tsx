import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  CreditCard,
  Lightbulb,
  PiggyBank,
  Shield,
  Wallet,
  X,
} from 'lucide-react';

type BlockId =
  | 'income'
  | 'debt'
  | 'spending'
  | 'saving'
  | 'protection'
  | 'investing'
  | 'vision';

type BlockData = {
  id: BlockId;
  label: string;
  principle: string;
  description: string;
  primaryPillar: string;
  supports?: string[];
};

type HouseLayoutProps = {
  className?: string;
};

const BLOCKS: Record<BlockId, BlockData> = {
  income: {
    id: 'income',
    label: 'Income',
    principle: 'Increase your earning power',
    description:
      'Income is the engine of your financial life. Strong income creates options, supports stability, and gives every other part of the house room to grow.',
    primaryPillar: 'Clarity',
    supports: ['Control', 'Growth'],
  },
  debt: {
    id: 'debt',
    label: 'Debt',
    principle: 'Manage and eliminate drag',
    description:
      'Debt affects cash flow, stress, and flexibility. Getting debt under control strengthens the foundation and helps you make progress with less friction.',
    primaryPillar: 'Efficiency',
    supports: ['Control', 'Security'],
  },
  spending: {
    id: 'spending',
    label: 'Spending',
    principle: 'Live within your means',
    description:
      'Spending habits determine whether money is your servant or your master. Mindful spending aligned with your values prevents lifestyle creep and creates space for what truly matters.',
    primaryPillar: 'Control',
    supports: ['Consistency', 'Efficiency'],
  },
  saving: {
    id: 'saving',
    label: 'Saving',
    principle: 'Build financial margin',
    description:
      'Saving creates breathing room. It helps absorb shocks, reduces stress, and gives you the margin needed to make stronger long-term decisions.',
    primaryPillar: 'Consistency',
    supports: ['Security', 'Control'],
  },
  protection: {
    id: 'protection',
    label: 'Protection',
    principle: 'Prepare for the unexpected',
    description:
      'Protection keeps one setback from undoing years of progress. Insurance, safeguards, and contingency planning help preserve what you are building.',
    primaryPillar: 'Security',
    supports: ['Consistency'],
  },
  investing: {
    id: 'investing',
    label: 'Investing',
    principle: 'Put your money to work',
    description:
      'Investing turns today’s margin into tomorrow’s freedom. It is how a stable financial life begins to grow beyond just paying bills and covering needs.',
    primaryPillar: 'Growth',
    supports: ['Purpose', 'Clarity'],
  },
  vision: {
    id: 'vision',
    label: 'Vision',
    principle: 'Know what you are building toward',
    description:
      'Vision gives the whole system direction. It connects money to meaning, helping you decide what matters most and making sure your financial life supports the life you actually want.',
    primaryPillar: 'Purpose',
    supports: ['Clarity'],
  },
};

function getIcon(id: BlockId) {
  const cls = 'h-7 w-7 md:h-8 md:w-8';
  switch (id) {
    case 'income':
      return <Wallet className={cls} strokeWidth={1.75} />;
    case 'debt':
      return <CreditCard className={cls} strokeWidth={1.75} />;
    case 'spending':
      return <CreditCard className={cls} strokeWidth={1.75} />;
    case 'saving':
      return <PiggyBank className={cls} strokeWidth={1.75} />;
    case 'protection':
      return <Shield className={cls} strokeWidth={1.75} />;
    case 'investing':
      return <ArrowUpRight className={cls} strokeWidth={1.75} />;
    case 'vision':
      return <Lightbulb className={cls} strokeWidth={1.75} />;
    default:
      return <Wallet className={cls} strokeWidth={1.75} />;
  }
}

const rowVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay,
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

type BlockTileProps = {
  block: BlockData;
  selected: boolean;
  onClick: (id: BlockId) => void;
  foundation?: boolean;
};

function BlockTile({ block, selected, onClick, foundation = false }: BlockTileProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(block.id)}
      className="group relative w-full text-left outline-none"
      aria-label={`Open ${block.label} details`}
    >
      <div
        className={[
          'relative overflow-hidden rounded-xl border bg-[#f7f4ee]',
          'transition-all duration-300',
          foundation
            ? 'min-h-[108px] md:min-h-[122px] border-[#27466b]/22 shadow-[0_8px_20px_rgba(15,42,68,0.08),inset_0_1px_0_rgba(255,255,255,0.88)]'
            : 'min-h-[92px] md:min-h-[100px] border-[#27466b]/18 shadow-[0_6px_16px_rgba(15,42,68,0.06),inset_0_1px_0_rgba(255,255,255,0.85)]',
          selected
            ? 'border-[#b87333]/70 shadow-[0_12px_26px_rgba(15,42,68,0.11),0_0_0_1px_rgba(184,115,51,0.2)]'
            : 'group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_22px_rgba(15,42,68,0.1)]',
        ].join(' ')}
      >
        <div className="absolute inset-[6px] rounded-[14px] border border-[#27466b]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.56)_0%,rgba(255,255,255,0.16)_100%)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.72),inset_0_-8px_16px_rgba(39,70,107,0.04)]" />

        {foundation && (
          <div className="absolute inset-x-0 bottom-0 h-3 bg-[linear-gradient(180deg,rgba(15,42,68,0.00),rgba(15,42,68,0.04))]" />
        )}

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-4 text-center">
          <div className="mb-2 text-[#1f3b5b] opacity-95">{getIcon(block.id)}</div>
          <div className="text-[0.7rem] md:text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[#18314f]">
            {block.label}
          </div>
        </div>
      </div>
    </button>
  );
}

function RoofTile({
  block,
  selected,
  onClick,
}: {
  block: BlockData;
  selected: boolean;
  onClick: (id: BlockId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(block.id)}
      className="group relative mx-auto block w-full outline-none"
      aria-label={`Open ${block.label} details`}
    >
      <div className="relative h-[112px] md:h-[136px]">
        <div
          className={[
            'absolute inset-0 overflow-hidden border bg-[#f3efe7]',
            'shadow-[0_8px_18px_rgba(15,42,68,0.07),inset_0_1px_0_rgba(255,255,255,0.82)] transition-all duration-300',
            selected
              ? 'border-[#b87333]/70 shadow-[0_12px_26px_rgba(15,42,68,0.11),0_0_0_1px_rgba(184,115,51,0.2)]'
              : 'border-[#27466b]/22 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_22px_rgba(15,42,68,0.1)]',
          ].join(' ')}
          style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
        >
          <div
            className="absolute inset-[8px] border border-[#27466b]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.12)_100%)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.66),inset_0_-10px_18px_rgba(39,70,107,0.04)]"
            style={{ clipPath: 'polygon(50% 2%, 98% 100%, 2% 100%)' }}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[38%] z-10 flex flex-col items-center justify-center text-center">
          <div className="mb-1 text-[#1f3b5b]">{getIcon(block.id)}</div>
          <div className="text-[0.68rem] md:text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#18314f]">
            {block.label}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-[7%] top-[5px] h-[5px] rounded-full bg-[linear-gradient(90deg,rgba(184,115,51,0.7),rgba(212,161,92,0.98),rgba(184,115,51,0.7))]"
          style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
        />
      </div>
    </button>
  );
}

function BlockModal({
  block,
  onClose,
}: {
  block: BlockData | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {block && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-[#0f2a44]/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-[620px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-hidden rounded-[28px] border border-[#27466b]/15 bg-white shadow-[0_40px_100px_rgba(15,42,68,0.25)]">
                <div className="flex items-start justify-between px-6 pb-2 pt-6 md:px-8 md:pt-7">
                  <div className="text-[#1f3b5b]">{getIcon(block.id)}</div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-2 text-[#5f7188] transition hover:bg-slate-100 hover:text-[#18314f]"
                    aria-label="Close details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 pb-6 pt-2 md:px-8 md:pb-8">
                  <h3 className="text-xl font-semibold tracking-[0.04em] text-[#18314f]">
                    {block.label.toUpperCase()}
                  </h3>

                  <p className="mt-2 text-lg font-semibold text-[#b87333]">
                    {block.principle}
                  </p>

                  <p className="mt-5 text-base leading-8 text-[#46617e]">
                    {block.description}
                  </p>

                  <div className="my-5 h-px bg-gray-100" />

                  <div className="mt-0 rounded-2xl bg-[#eff4fb]/80 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-[#4f72a2]">
                      Primary Pillar Strengthened
                    </div>
                    <div className="mt-2 text-xl font-semibold text-[#18314f]">
                      {block.primaryPillar}
                    </div>
                  </div>

                  {block.supports && block.supports.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-[#f7f7f8] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6a7380]">
                        Also Supports
                      </div>
                      <div className="mt-2 text-base text-[#46617e]">
                        {block.supports.join(' • ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function HouseLayout({ className = '' }: HouseLayoutProps) {
  const [selectedId, setSelectedId] = useState<BlockId | null>(null);

  const selectedBlock = useMemo(
    () => (selectedId ? BLOCKS[selectedId] : null),
    [selectedId]
  );

  const openBlock = (id: BlockId) => setSelectedId(id);
  const closeModal = () => setSelectedId(null);

  return (
    <>
      <div className={`mx-auto w-full max-w-[360px] md:max-w-[450px] ${className}`}>
        <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(247,244,238,0.95)_0%,rgba(239,244,249,0.98)_100%)] px-3 py-4 md:px-4 md:py-5 shadow-[0_18px_40px_rgba(15,42,68,0.06)]">
          <motion.div initial="hidden" animate="show" className="mx-auto">
            <motion.div
              custom={0.42}
              variants={rowVariants}
              className="mx-auto w-full max-w-[320px] md:max-w-[380px]"
            >
              <RoofTile
                block={BLOCKS.vision}
                selected={selectedId === 'vision'}
                onClick={openBlock}
              />
            </motion.div>

            <motion.div
              className="mx-auto mt-1.5 grid w-full max-w-[320px] md:max-w-[380px] grid-cols-2 gap-2.5"
              custom={0.28}
              variants={rowVariants}
            >
              <BlockTile
                block={BLOCKS.protection}
                selected={selectedId === 'protection'}
                onClick={openBlock}
              />
              <BlockTile
                block={BLOCKS.investing}
                selected={selectedId === 'investing'}
                onClick={openBlock}
              />
            </motion.div>

            <motion.div
              className="mx-auto mt-2 grid w-full max-w-[320px] md:max-w-[380px] grid-cols-2 gap-2.5"
              custom={0.14}
              variants={rowVariants}
            >
              <BlockTile
                block={BLOCKS.spending}
                selected={selectedId === 'spending'}
                onClick={openBlock}
              />
              <BlockTile
                block={BLOCKS.saving}
                selected={selectedId === 'saving'}
                onClick={openBlock}
              />
            </motion.div>

            <motion.div
              className="mx-auto mt-2 grid w-full max-w-[348px] md:max-w-[420px] grid-cols-2 gap-2.5"
              custom={0.04}
              variants={rowVariants}
            >
              <BlockTile
                block={BLOCKS.income}
                selected={selectedId === 'income'}
                onClick={openBlock}
                foundation
              />
              <BlockTile
                block={BLOCKS.debt}
                selected={selectedId === 'debt'}
                onClick={openBlock}
                foundation
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <BlockModal block={selectedBlock} onClose={closeModal} />
    </>
  );
}