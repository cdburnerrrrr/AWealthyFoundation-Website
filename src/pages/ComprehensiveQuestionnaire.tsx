import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  Eye,
  Home,
  Lock,
  PiggyBank,
  Shield,
  Square,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  BUILDING_BLOCK_LABELS,
  generateReport,
  getMilestonesForStage,
  type BuildingBlockKey,
  type Question,
} from '../types/assessment';
import { getDetailedQuestions, getSnapshotQuestions } from '../types/optimized_question_config';
import { useAppStore } from '../store/appStore';

type ResponseValue = string | string[] | number | null;

const SECTION_ICONS: Record<string, React.ElementType> = {
  income: DollarSign,
  spending: CreditCard,
  saving: PiggyBank,
  debt: CreditCard,
  protection: Shield,
  investing: TrendingUp,
  vision: Eye,
  context: Users,
  foundation: Users,
};

const ROUTING_KEYS = new Set([
  'ageRange',
  'relationshipStatus',
  'housingStatus',
]);

const SECTION_META: Record<
  string,
  {
    shortLabel: string;
    transitionTitle: string;
    transitionBody: string;
    colorClass: string;
    eyebrow?: string;
  }
> = {
  foundation: {
    shortLabel: 'Foundation Today',
    transitionTitle: 'Let’s start with your foundation today.',
    transitionBody:
      'We’ll begin with the basics so the rest of your review can adapt around your real situation.',
    colorClass: 'bg-gradient-to-br from-[#1a365d] to-[#2c4b71]',
    eyebrow: '',
  },
  context: {
    shortLabel: 'About You',
    transitionTitle: 'Let’s start with your foundation today.',
    transitionBody:
      'We’ll begin with the basics so the rest of your review can adapt around your real situation.',
    colorClass: 'bg-gradient-to-br from-[#1a365d] to-[#2c4b71]',
    eyebrow: '',
  },
  income: {
    shortLabel: 'Income',
    transitionTitle: 'Next, let’s look at your income picture.',
    transitionBody:
      'This helps us understand the base supporting the rest of your financial foundation.',
    colorClass: 'bg-gradient-to-br from-[#2a4b73] to-[#3e6b98]',
    eyebrow: 'Income',
  },
  spending: {
    shortLabel: 'Cash Flow',
    transitionTitle: 'Now let’s look at cash flow and fixed costs.',
    transitionBody:
      'This section helps us understand how much breathing room you really have each month.',
    colorClass: 'bg-gradient-to-br from-[#4b6176] to-[#6f8398]',
    eyebrow: 'Cash Flow',
  },
  saving: {
    shortLabel: 'Saving',
    transitionTitle: 'Next, let’s review your savings foundation.',
    transitionBody:
      'We’re looking at how much buffer and resilience you have in place today.',
    colorClass: 'bg-gradient-to-br from-[#2f6771] to-[#4b9498]',
    eyebrow: 'Saving',
  },
  debt: {
    shortLabel: 'Debt',
    transitionTitle: 'Now let’s review debt pressure.',
    transitionBody:
      'This helps us see whether debt is manageable or quietly slowing progress elsewhere.',
    colorClass: 'bg-gradient-to-br from-[#7f533a] to-[#ad7248]',
    eyebrow: 'Debt',
  },
  protection: {
    shortLabel: 'Protection',
    transitionTitle: 'Next, let’s look at protection.',
    transitionBody:
      'This section helps us understand how protected your foundation is when life gets expensive.',
    colorClass: 'bg-gradient-to-br from-[#55657d] to-[#7e92ab]',
    eyebrow: 'Protection',
  },
  investing: {
    shortLabel: 'Investing',
    transitionTitle: 'Now let’s look at long-term growth.',
    transitionBody:
      'This helps us understand whether your current system is building toward future freedom.',
    colorClass: 'bg-gradient-to-br from-[#315f79] to-[#4f93aa]',
    eyebrow: 'Investing',
  },
  vision: {
    shortLabel: 'Vision',
    transitionTitle: 'You’re making great progress.',
    transitionBody:
      'This last stretch helps us shape your recommendations around what matters most to you.',
    colorClass: 'bg-gradient-to-br from-[#8b6a44] to-[#c58b55]',
    eyebrow: 'Vision',
  },
};

const INLINE_GROUPS: Record<string, string[]> = {
  relationshipStatus: ['monthlyChildcareCost', 'childcarePressure', 'lifeInsurance'],
  housingStatus: ['mortgageBalance', 'homeValue', 'mortgageImpact'],
  vehicleDebt: ['carLoanBalance', 'leasePayment'],
  otherDebt: ['creditCardBehavior'],
  healthInsurance: ['incomeInterruptionCoverage', 'propertyCoverage', 'autoCoverage'],
  investingStatus: [
    'employerMatch',
    'investmentAccounts',
    'investmentConfidence',
    'totalInvestments',
  ],
  savingConsistency: ['savingsAutomation'],
};

const CHILD_KEYS = new Set(Object.values(INLINE_GROUPS).flat());

function getEffectiveSectionKey(question?: Question) {
  if (!question) return 'foundation';
  if (ROUTING_KEYS.has(question.key)) return 'foundation';
  return question.section ?? 'context';
}

function getSectionLabel(section?: Question['section'], key?: string) {
  if (key && ROUTING_KEYS.has(key)) return 'Foundation Today';
  if (!section) return '';
  if (section === 'context') return 'About You';
  return BUILDING_BLOCK_LABELS[section as BuildingBlockKey] ?? 'Assessment';
}

function isAnswered(question: Question | undefined, value: ResponseValue | undefined) {
  if (!question) return false;

  switch (question.type) {
    case 'multiple':
      return Array.isArray(value) && value.length > 0;
    case 'number':
      return (
        value !== '' &&
        value !== undefined &&
        value !== null &&
        !Number.isNaN(Number(value))
      );
    case 'single':
    case 'scale':
      return value !== '' && value !== undefined && value !== null;
    default:
      return false;
  }
}

function getRenderableQuestions(visibleQuestions: Question[]) {
  return visibleQuestions.filter((question) => !CHILD_KEYS.has(question.key));
}

function getSectionSequence(questions: Question[]) {
  const seen = new Set<string>();
  const sequence: string[] = [];

  questions.forEach((question) => {
    const section = getEffectiveSectionKey(question);
    if (!seen.has(section)) {
      seen.add(section);
      sequence.push(section);
    }
  });

  return sequence;
}

function getSequentialVisibleChildQuestions(
  rootQuestion: Question | undefined,
  visibleQuestions: Question[],
  responses: Record<string, any>
) {
  if (!rootQuestion) return [];

  const childKeys = INLINE_GROUPS[rootQuestion.key] ?? [];
  const children = childKeys
    .map((key) => visibleQuestions.find((question) => question.key === key))
    .filter(Boolean) as Question[];

  if (!isAnswered(rootQuestion, responses[rootQuestion.key])) {
    return [];
  }

  const revealed: Question[] = [];

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];
    revealed.push(child);

    if (!isAnswered(child, responses[child.key])) {
      break;
    }
  }

  return revealed;
}

function getContinueModeQuestions(responses: Record<string, any>) {
  const detailed = getDetailedQuestions(responses);
  const snapshotKeys = new Set(getSnapshotQuestions(responses).map((q) => q.key));

  return detailed.filter((question) => {
    const answered = isAnswered(question, responses[question.key]);
    return !(snapshotKeys.has(question.key) && answered);
  });
}

function getLatestFreeAssessment(assessmentHistory: any[]) {
  return [...(assessmentHistory || [])]
    .filter((item) => item?.assessmentType === 'free')
    .sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0))[0] || null;
}

function TrustBlock() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-slate-100 p-2 text-navy-900">
          <Lock className="h-4 w-4" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Your data stays private.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your assessment information is stored securely, used only to generate
            your experience inside A Wealthy Foundation, and is never sold to
            outside advisors or marketers.
          </p>
          <p className="mt-2 text-sm font-medium text-slate-800">
            You will not receive calls or outreach as a result of this assessment.
          </p>
        </div>
      </div>
    </div>
  );
}

function TrustInline() {
  return (
    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
      <Lock className="h-3.5 w-3.5" />
      <span>Private • Never sold • No outreach</span>
    </div>
  );
}

type ProgressProps = {
  sectionTitle: string;
  sectionIndex: number;
  totalSections: number;
  currentStep: number;
  totalSteps: number;
};

function ProgressHeader({
  sectionTitle,
  sectionIndex,
  totalSections,
  currentStep,
  totalSteps,
}: ProgressProps) {
  const percent = totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0;
  const remaining = Math.max(totalSteps - currentStep - 1, 0);

  return (
    <div className="bg-white border-b border-gray-100 py-3">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-navy-700">{sectionTitle}</span>
          <span className="text-sm text-gray-500">{percent}% complete</span>
        </div>

        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-copper-500 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>
            Section {sectionIndex} of {totalSections}
          </span>
          <span>About {remaining} questions left</span>
        </div>
      </div>
    </div>
  );
}

type TransitionCardProps = {
  sectionKey: string;
  onContinue: () => void;
  onBack: () => void;
  isFirst: boolean;
};

function TransitionCard({ sectionKey, onContinue, onBack, isFirst }: TransitionCardProps) {
  const meta = SECTION_META[sectionKey] ?? SECTION_META.foundation;

  return (
    <div className={`rounded-3xl p-8 text-white shadow-sm ${meta.colorClass}`}>
      {!isFirst && meta.eyebrow ? (
        <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
          {meta.eyebrow}
        </div>
      ) : null}

      <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight">
        {meta.transitionTitle}
      </h2>

      <p className="mt-3 max-w-2xl text-sm md:text-base leading-6 text-white/90">
        {meta.transitionBody}
      </p>

      <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 transition"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

type IntroCardProps = {
  onStart: () => void;
  isContinueMode?: boolean;
};

function IntroCard({ onStart, isContinueMode = false }: IntroCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-10">
      <div className="inline-flex rounded-full bg-copper-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
{isContinueMode ? 'Continue Your Full Assessment' : 'Guided Financial Review'}
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900">
            {isContinueMode ? 'Continue Your Full Assessment' : 'Full Foundation Assessment'}
          </h1>

          <p className="mt-4 text-gray-600 leading-7 max-w-2xl">
            {isContinueMode
              ? 'You already completed the snapshot. This next step picks up where you left off, asks only the additional questions needed for the full picture, and leads into your complete report.'
              : 'This is not a barrage of questions. We’re using this guided review to understand where you are now, what may be holding you back, and which steps could help you make the most progress next.'}
          </p>

          <div className="mt-6 rounded-2xl border border-copper-100 bg-copper-50/40 p-4">
            <h3 className="text-sm font-semibold text-navy-900">
              Regular monthly expenses may include:
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Streaming services, gas, water, electric, internet, trash, lawn care,
              car insurance, cable, and subscriptions like a car wash plan.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-navy-900">What to expect</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>{isContinueMode ? 'Takes about 2–3 minutes' : 'Takes about 8–12 minutes'}</li>
              <li>Most answers can be estimates</li>
              <li>You do not need every number in front of you</li>
              <li>{isContinueMode ? 'You will not repeat the questions you already answered' : 'We’ll guide you section by section'}</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-navy-900">Helpful to have nearby</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Approximate take-home income</li>
              <li>Regular monthly expenses</li>
              <li>Savings and investment balances</li>
              <li>Debt balances or payment estimates</li>
              <li>Mortgage balance and home value, if applicable</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <TrustBlock />
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-copper-600 px-6 py-3 text-white font-bold hover:bg-copper-700 transition"
      >
        {isContinueMode ? 'Continue Where I Left Off' : 'Start My Full Assessment'}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

type OptionGridProps = {
  question: Question;
  value: ResponseValue | undefined;
  onChange: (value: ResponseValue) => void;
};

function OptionGrid({ question, value, onChange }: OptionGridProps) {
  if (!question.options?.length) return null;

  if (question.type === 'multiple') {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <div>
        <div className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Select all that apply
        </div>

        <div className="grid gap-3">
          {question.options.map((option) => {
            const selected = selectedValues.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const next = selected
                    ? selectedValues.filter((item) => item !== option.value)
                    : [...selectedValues, option.value];
                  onChange(next);
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  selected
                    ? 'border-copper-500 bg-copper-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0">
                    {selected ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-copper-600 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-400">
                        <Square className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {question.options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border p-4 text-left transition ${
              selected
                ? 'border-copper-500 bg-copper-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-sm font-semibold text-slate-900">{option.label}</div>
          </button>
        );
      })}
    </div>
  );
}

type NumberInputProps = {
  question: Question;
  value: ResponseValue | undefined;
  onChange: (value: ResponseValue) => void;
  onEnter?: () => void;
};

function NumberInput({ question, value, onChange, onEnter }: NumberInputProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Best guess is fine
      </label>
      <input
        type="number"
        inputMode="decimal"
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === '' ? '' : Number(raw));
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && isAnswered(question, value)) {
            onEnter?.();
          }
        }}
        placeholder={question.placeholder || 'Enter amount'}
        className="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

type ScaleInputProps = {
  question: Question;
  value: ResponseValue | undefined;
  onChange: (value: ResponseValue) => void;
};

function ScaleInput({ question, value, onChange }: ScaleInputProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {(question.options ?? []).map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-3 py-4 text-sm font-semibold transition ${
              selected
                ? 'border-copper-500 bg-copper-50 text-slate-900'
                : 'border-gray-200 bg-white text-slate-700 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type QuestionInputProps = {
  question: Question;
  value: ResponseValue | undefined;
  onChange: (value: ResponseValue) => void;
  onEnter?: () => void;
};

function QuestionInput({ question, value, onChange, onEnter }: QuestionInputProps) {
  if (question.type === 'number') {
    return <NumberInput question={question} value={value} onChange={onChange} onEnter={onEnter} />;
  }

  if (question.type === 'scale') {
    return <ScaleInput question={question} value={value} onChange={onChange} />;
  }

  return <OptionGrid question={question} value={value} onChange={onChange} />;
}

type InlineChildCardProps = {
  question: Question;
  value: ResponseValue | undefined;
  onChange: (value: ResponseValue) => void;
  onEnter?: () => void;
  stepNumber: number;
};

function InlineChildCard({
  question,
  value,
  onChange,
  onEnter,
  stepNumber,
}: InlineChildCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border border-slate-200">
        Follow-up {stepNumber}
      </div>

      <div className="mt-3 rounded-2xl border-l-4 border-copper-500 bg-white px-4 py-4">
        <h3 className="text-lg font-semibold text-navy-900 leading-tight">
          {question.question}
        </h3>

        {question.helperText ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">{question.helperText}</p>
        ) : null}
      </div>

      <div className="mt-4">
        <QuestionInput
          question={question}
          value={value}
          onChange={onChange}
          onEnter={onEnter}
        />
      </div>
    </div>
  );
}

export default function ComprehensiveQuestionnaire() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    isAuthenticated,
    saveAssessment,
    setCurrentAssessment,
    assessmentHistory,
    snapshotAnswers,
    setSnapshotAnswers,
    currentAssessment,
  } = useAppStore();

  const isContinueMode = searchParams.get('mode') === 'continue';
  const latestFreeAssessment = useMemo(
    () => getLatestFreeAssessment(assessmentHistory as any[]),
    [assessmentHistory]
  );

  const baseContinueAnswers = useMemo(() => {
    if (!isContinueMode) return null;

    if (snapshotAnswers && Object.keys(snapshotAnswers).length > 0) return snapshotAnswers;
    if (latestFreeAssessment?.answers && Object.keys(latestFreeAssessment.answers).length > 0) {
      return latestFreeAssessment.answers;
    }
    if (latestFreeAssessment?.report?.answers && Object.keys(latestFreeAssessment.report.answers).length > 0) {
      return latestFreeAssessment.report.answers;
    }
    if (currentAssessment?.assessmentType === 'free' && currentAssessment?.answers) {
      return currentAssessment.answers;
    }

    return null;
  }, [isContinueMode, snapshotAnswers, latestFreeAssessment, currentAssessment]);

  const initialResponses = useMemo(
    () => (isContinueMode && baseContinueAnswers ? baseContinueAnswers : {}),
    [isContinueMode, baseContinueAnswers]
  );

  const [mode, setMode] = useState<'intro' | 'transition' | 'question'>('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>(() =>
    isContinueMode ? getContinueModeQuestions(initialResponses) : getDetailedQuestions(initialResponses)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderableQuestions = useMemo(
    () => getRenderableQuestions(visibleQuestions),
    [visibleQuestions]
  );

  const currentQuestion = renderableQuestions[currentStep];

  const currentInlineQuestions = useMemo(
    () =>
      getSequentialVisibleChildQuestions(currentQuestion, visibleQuestions, responses),
    [currentQuestion, responses, visibleQuestions]
  );

  const sectionSequence = useMemo(
    () => getSectionSequence(renderableQuestions),
    [renderableQuestions]
  );

  const currentSectionKey = getEffectiveSectionKey(currentQuestion);
  const currentSectionIndex = Math.max(sectionSequence.indexOf(currentSectionKey) + 1, 1);
  const currentSectionMeta = SECTION_META[currentSectionKey] ?? SECTION_META.foundation;
  const currentSectionLabel =
    getSectionLabel(currentQuestion?.section, currentQuestion?.key) ||
    currentSectionMeta.shortLabel;

  useEffect(() => {
    const nextResponses = isContinueMode && baseContinueAnswers ? baseContinueAnswers : {};
    setResponses(nextResponses);
    setVisibleQuestions(
      isContinueMode ? getContinueModeQuestions(nextResponses) : getDetailedQuestions(nextResponses)
    );
    setCurrentStep(0);
    setMode('intro');
  }, [isContinueMode, baseContinueAnswers]);

  useEffect(() => {
    if (currentStep > 0 && currentStep >= renderableQuestions.length) {
      setCurrentStep(Math.max(0, renderableQuestions.length - 1));
    }
  }, [currentStep, renderableQuestions.length]);

  const updateResponses = (key: string, value: ResponseValue) => {
    const updated = { ...responses, [key]: value };
    const filtered = isContinueMode ? getContinueModeQuestions(updated) : getDetailedQuestions(updated);

    setResponses(updated);
    setVisibleQuestions(filtered);

    const nextRenderable = getRenderableQuestions(filtered);
    if (currentStep >= nextRenderable.length) {
      setCurrentStep(Math.max(0, nextRenderable.length - 1));
    }

    return { updated, filtered, nextRenderable };
  };

  const canProceed = useMemo(() => {
    if (!currentQuestion) return false;

    const group = [currentQuestion, ...currentInlineQuestions];

    return group.every((question) => {
      if (question.required === false) return true;
      return isAnswered(question, responses[question.key]);
    });
  }, [currentInlineQuestions, currentQuestion, responses]);

  const goNext = () => {
    if (!currentQuestion || currentStep >= renderableQuestions.length - 1) return;

    const nextQuestion = renderableQuestions[currentStep + 1];
    setCurrentStep((prev) => prev + 1);

    if (nextQuestion && getEffectiveSectionKey(nextQuestion) !== getEffectiveSectionKey(currentQuestion)) {
      setMode('transition');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (currentStep === 0) {
      setMode('intro');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentStep((prev) => prev - 1);
    setMode('question');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleValueChange = (question: Question, value: ResponseValue) => {
    const nextResponses = { ...responses, [question.key]: value };
    const { filtered } = updateResponses(question.key, value);

    if (question.key === currentQuestion?.key && (question.type === 'single' || question.type === 'scale')) {
      const nextVisibleChildren = getSequentialVisibleChildQuestions(
        question,
        filtered,
        nextResponses
      );

      const answeredRoot = isAnswered(question, value);
      const hasInlineFollowUps = nextVisibleChildren.length > 0;

      if (answeredRoot && !hasInlineFollowUps) {
        setTimeout(() => {
          if (currentStep < renderableQuestions.length - 1) {
            goNext();
          }
        }, 0);
      }
    }

    if (CHILD_KEYS.has(question.key)) {
      const root = currentQuestion;
      if (!root) return;

      const updatedChildren = getSequentialVisibleChildQuestions(root, filtered, nextResponses);
      const group = [root, ...updatedChildren];

      const allAnswered = group.every((q) => {
        if (q.required === false) return true;
        return isAnswered(q, nextResponses[q.key]);
      });

      const shouldAutoAdvanceChild =
        question.type === 'single' || question.type === 'scale';

      if (allAnswered && shouldAutoAdvanceChild) {
        setTimeout(() => {
          if (currentStep < renderableQuestions.length - 1) {
            goNext();
          }
        }, 0);
      }
    }
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);

    try {
      const mergedAnswers = isContinueMode && baseContinueAnswers
        ? { ...baseContinueAnswers, ...responses }
        : responses;

      const report = generateReport(mergedAnswers, 'detailed');
      setCurrentAssessment({
        foundationScore: report.foundationScore,
        scoreBand: report.scoreBand,
        pillars: report.pillarScores,
        insights: report.insights ?? [],
        topFocusAreas: report.priorities ?? [],
        summary: report.summary ?? '',
        nextStep: report.nextStep ?? '',
        answers: mergedAnswers,
        report,
        assessmentType: 'detailed',
      });

      if (isAuthenticated) {
        const milestonesCompleted: string[] = [];
        if (report.buildingBlockScores?.saving >= 50) milestonesCompleted.push('starter_emergency');
        if (report.buildingBlockScores?.debt >= 70) milestonesCompleted.push('no_high_interest_debt');
        if (report.buildingBlockScores?.investing >= 50) milestonesCompleted.push('regular_investing');

        await saveAssessment({
          assessmentType: 'detailed',
          overallScore: report.foundationScore,
          buildingBlockScores: report.buildingBlockScores,
          pillarScores: report.pillarScores,
          lifeStage: report.lifeStage,
          insights: report.insights,
          priorities: report.priorities,
          actionPlan: report.actionPlan,
          summary: report.summary,
          nextStep: report.nextStep,
          report,
          answers: mergedAnswers,
          milestonesCompleted,
          nextMilestones: getMilestonesForStage(report.lifeStage)
            .filter((m) => !milestonesCompleted.includes(m.id))
            .slice(0, 3)
            .map((m) => m.id),
        });
      }

      setSnapshotAnswers(null);
      navigate('/results');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('There was a problem saving your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion && mode !== 'intro') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-3">Detailed Assessment</h1>
          <p className="text-gray-600 mb-6">
            We could not load the assessment questions right now. Please go back and try again.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-3 rounded-xl bg-copper-600 text-white font-semibold hover:bg-copper-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const HeaderIcon =
    currentQuestion?.section
      ? SECTION_ICONS[getEffectiveSectionKey(currentQuestion)] ??
        SECTION_ICONS[currentQuestion.section]
      : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80"
            >
              <Home className="w-8 h-8 text-copper-600" />
              <span className="font-serif font-bold text-navy-900">
                A Wealthy Foundation
              </span>
            </button>

            <button
              onClick={() => navigate('/my-foundation')}
              className="text-sm text-copper-600 font-medium"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {mode !== 'intro' && currentQuestion ? (
        <ProgressHeader
          sectionTitle={currentSectionLabel}
          sectionIndex={currentSectionIndex}
          totalSections={sectionSequence.length}
          currentStep={currentStep}
          totalSteps={renderableQuestions.length}
        />
      ) : null}

      <main className="flex-1 py-8">
        <div className={`${mode === 'intro' ? 'max-w-5xl' : 'max-w-2xl'} mx-auto px-4`}>
          {mode === 'intro' ? (
            <IntroCard
              isContinueMode={isContinueMode}
              onStart={() => {
                setMode('transition');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : mode === 'transition' ? (
            <TransitionCard
              sectionKey={currentSectionKey}
              isFirst={currentStep === 0}
              onBack={goBack}
              onContinue={() => {
                setMode('question');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              {currentQuestion.section && (
                <div className="flex items-center gap-2 mb-4">
                  {HeaderIcon ? <HeaderIcon className="w-4 h-4 text-copper-600" /> : null}
                  <span className="text-xs font-medium text-copper-600 uppercase tracking-wide">
                    {currentSectionLabel}
                  </span>
                </div>
              )}

              <div className="rounded-2xl border-l-4 border-copper-500 bg-slate-100 border border-slate-200 px-4 py-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-navy-900 leading-tight">
                  {currentQuestion.question}
                </h1>

                {currentQuestion.helperText ? (
                  <p className="mt-3 text-gray-600 leading-7">{currentQuestion.helperText}</p>
                ) : null}
              </div>

              <div className="mt-2">
                <QuestionInput
                  question={currentQuestion}
                  value={responses[currentQuestion.key]}
                  onChange={(value) => handleValueChange(currentQuestion, value)}
                  onEnter={() => {
                    if (canProceed) {
                      if (currentStep === renderableQuestions.length - 1) {
                        submitAssessment();
                      } else {
                        goNext();
                      }
                    }
                  }}
                />
              </div>

              {currentInlineQuestions.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {currentInlineQuestions.map((childQuestion, index) => (
                    <InlineChildCard
                      key={childQuestion.key}
                      question={childQuestion}
                      value={responses[childQuestion.key]}
                      onChange={(value) => handleValueChange(childQuestion, value)}
                      onEnter={() => {
                        if (canProceed) {
                          if (currentStep === renderableQuestions.length - 1) {
                            submitAssessment();
                          } else {
                            goNext();
                          }
                        }
                      }}
                      stepNumber={index + 1}
                    />
                  ))}
                </div>
              ) : null}

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-navy-700 hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>

                {currentStep === renderableQuestions.length - 1 ? (
                  <button
                    onClick={submitAssessment}
                    disabled={isSubmitting || !canProceed}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold ${
                      canProceed && !isSubmitting
                        ? 'bg-copper-600 text-white hover:bg-copper-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Building Your Report...' : 'See My Results'}
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    disabled={!canProceed}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold ${
                      canProceed
                        ? 'bg-copper-600 text-white hover:bg-copper-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              <TrustInline />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}