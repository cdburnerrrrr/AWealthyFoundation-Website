import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Home,
  ArrowRight,
  Target,
  TrendingUp,
  PiggyBank,
  CreditCard,
  DollarSign,
  Eye,
  Shield,
  Star,
  Sparkles,
} from 'lucide-react';
import {
  generateReport,
  BUILDING_BLOCK_LABELS,
  PILLAR_LABELS,
  type BuildingBlockKey,
  type PillarKey,
  type Question,
  getScoreBand,
  LIFE_STAGE_LABELS,
} from '../types/assessment';
import { getSnapshotQuestions } from '../types/optimized_question_config';
import { useAppStore } from '../store/appStore';
import logoImage from '../assets/house-icon.png';

const SECTION_ICONS: Record<string, React.ElementType> = {
  income: DollarSign,
  spending: CreditCard,
  saving: PiggyBank,
  debt: CreditCard,
  protection: Shield,
  investing: TrendingUp,
  vision: Eye,
};

type ResponseValue = string | string[] | number;

type FreeReportResultsProps = {
  reportData: any;
  onUpgrade: () => void;
  onRetake: () => void;
};

function getSectionLabel(section?: Question['section']) {
  if (!section) return '';
  if (section === 'context') return 'About You';
  return BUILDING_BLOCK_LABELS[section as BuildingBlockKey] ?? 'Assessment';
}

function getSectionIntro(section?: Question['section']) {
  switch (section) {
    case 'income':
      return 'Let’s start with your income and stability.';
    case 'spending':
      return 'Now let’s look at the bills and costs shaping your month.';
    case 'saving':
      return 'Next, we’ll check your cushion and consistency.';
    case 'debt':
      return 'Let’s understand the obligations competing for your cash flow.';
    case 'protection':
      return 'A strong foundation also protects against setbacks.';
    case 'investing':
      return 'Now we’ll look at long-term progress and retirement.';
    case 'vision':
      return 'Finally, let’s make sure your financial direction is clear.';
    default:
      return 'Answer a few quick questions to personalize your snapshot.';
  }
}

export default function SnapshotQuestionnaire() {
  const navigate = useNavigate();
  const { isAuthenticated, saveAssessment, setCurrentAssessment } = useAppStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>(() =>
    getSnapshotQuestions({}) as Question[]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const totalSteps = visibleQuestions.length;
  const currentQuestion = visibleQuestions[currentStep];
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  useEffect(() => {
    if (currentStep > 0 && currentStep >= visibleQuestions.length) {
      setCurrentStep(Math.max(0, visibleQuestions.length - 1));
    }
  }, [currentStep, visibleQuestions.length]);

  const previewReport = useMemo(() => {
    if (Object.keys(responses).length < 4) return null;

    try {
      return generateReport(responses, 'free');
    } catch {
      return null;
    }
  }, [responses]);

  const updateResponses = (key: string, value: ResponseValue) => {
    const updated = { ...responses, [key]: value };
    const filtered = getSnapshotQuestions(updated) as Question[];

    setResponses(updated);
    setVisibleQuestions(filtered);

    if (currentStep >= filtered.length) {
      setCurrentStep(Math.max(0, filtered.length - 1));
    }

    return { updated, filtered };
  };

  const isQuestionAnswered = (
    question: Question | undefined,
    value: ResponseValue | undefined
  ) => {
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
  };

  const handleResponse = (question: Question, value: ResponseValue) => {
    updateResponses(question.key, value);

    if (question.type === 'single' && isQuestionAnswered(question, value)) {
      setTimeout(() => {
        if (currentStep < visibleQuestions.length - 1) {
          setCurrentStep((prev) => prev + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 0);
    }
  };

  const handleMultipleToggle = (question: Question, optionValue: string) => {
    const current = Array.isArray(responses[question.key])
      ? (responses[question.key] as string[])
      : [];

    const updated = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];

    updateResponses(question.key, updated);
  };

  const handleNumberChange = (question: Question, rawValue: string) => {
    if (rawValue === '') {
      updateResponses(question.key, '' as unknown as number);
      return;
    }

    updateResponses(question.key, rawValue as unknown as number);
  };

  const nextStep = () => {
    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const canProceed = () => {
    return isQuestionAnswered(
      currentQuestion,
      currentQuestion ? responses[currentQuestion.key] : undefined
    );
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);

    try {
      const report = generateReport(responses, 'free');
      setReportData(report);
      setCurrentAssessment(report);

      if (isAuthenticated) {
        await saveAssessment({
          assessmentType: 'free',
          overallScore: report.foundationScore,
          buildingBlockScores: report.buildingBlockScores,
          pillarScores: report.pillarScores,
          lifeStage: report.lifeStage,
          insights: report.insights,
          priorities: report.priorities,
          summary: report.summary,
          nextStep: report.nextStep,
          report,
        });
      }

      setShowResults(true);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('There was a problem generating your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResults && reportData) {
    return (
      <FreeReportResults
        reportData={reportData}
        onUpgrade={() => navigate('/pricing')}
        onRetake={() => {
          setShowResults(false);
          setReportData(null);
          setResponses({});
          setCurrentStep(0);
          setVisibleQuestions(getSnapshotQuestions({}) as Question[]);
          window.scrollTo({ top: 0, behavior: 'auto' });
        }}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7fafc_0%,#eef4f8_100%)] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 max-w-lg text-center">
          <img src={logoImage} alt="A Wealthy Foundation" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-900 mb-3">Snapshot unavailable</h1>
          <p className="text-gray-600 mb-6">
            We couldn’t load the Snapshot assessment questions. Please go back and try again.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-copper-600 text-white font-bold hover:bg-copper-700"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const sectionLabel = getSectionLabel(currentQuestion.section);
  const sectionIntro = getSectionIntro(currentQuestion.section);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fafc_0%,#eef4f8_100%)] flex flex-col">
      <header className="sticky top-0 z-50 border-b border-navy-900/10 bg-white/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-90">
              <img src={logoImage} alt="A Wealthy Foundation" className="w-8 h-8" />
              <div className="font-serif font-bold text-navy-900 leading-none whitespace-nowrap">
                A Wealthy Foundation
              </div>
            </button>
            <div className="hidden sm:block" />
          </div>
        </div>
      </header>

      <div className="bg-white/80 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 min-w-0 shrink-0">
              <img src={logoImage} alt="A Wealthy Foundation" className="w-7 h-7" />
              <div className="font-serif font-bold text-navy-900 whitespace-nowrap">
                A Wealthy Foundation
              </div>
            </div>

            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="font-medium text-navy-700 truncate">
                  Personalized Financial Snapshot
                </span>
                <span className="text-gray-500 whitespace-nowrap">
                  {currentStep + 1}/{totalSteps}
                </span>
              </div>

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-copper-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 shrink-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-copper-50 px-3 py-1.5 text-copper-700 border border-copper-100 text-sm">
                <Sparkles className="w-4 h-4" />
                Quick assessment
              </div>

              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/my-foundation')}
                  className="text-sm text-copper-600 font-medium whitespace-nowrap"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-navy-600 font-medium whitespace-nowrap"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-4 md:py-4">
        <div className="max-w-3xl mx-auto px-4">
          <div className="rounded-[28px] border border-[#d8e2ec] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] overflow-hidden">
            <div className="bg-gradient-to-r from-navy-900 to-[#23486f] px-5 md:px-6 py-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-copper-200 text-xs uppercase tracking-[0.18em] font-semibold mb-2">
                    {currentQuestion.section && (() => {
                      const Icon = SECTION_ICONS[currentQuestion.section];
                      return Icon ? <Icon className="w-4 h-4" /> : null;
                    })()}
                    <span>{sectionLabel}</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold leading-tight">
                    {currentQuestion.question}
                  </h1>
                  <p className="text-xs text-white/75 mt-1">
                    {sectionIntro}
                  </p>
                </div>

                <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/10 text-lg font-bold text-white">
                  {currentStep + 1}
                </div>
              </div>
            </div>

            <div className="px-5 md:px-6 py-5 md:py-6">
              {currentQuestion.helperText && (
                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-slate-600">
                  {currentQuestion.helperText}
                </div>
              )}

              {currentQuestion.type === 'single' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleResponse(currentQuestion, option.value)}
                      className={`group w-full px-4 py-3 text-left rounded-xl border-2 transition-all ${
                        responses[currentQuestion.key] === option.value
                          ? 'border-copper-500 bg-copper-50 text-navy-900 shadow-sm'
                          : 'border-gray-200 hover:border-copper-300 hover:bg-gray-50 text-navy-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base">{option.label}</span>
                        <span
                          className={`w-5 h-5 rounded-full border-2 transition-all ${
                            responses[currentQuestion.key] === option.value
                              ? 'border-copper-500 bg-copper-500 shadow-[inset_0_0_0_4px_white]'
                              : 'border-gray-300 group-hover:border-copper-300'
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'multiple' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const selected = Array.isArray(responses[currentQuestion.key])
                      ? (responses[currentQuestion.key] as string[]).includes(option.value)
                      : false;

                    return (
                      <button
                        key={option.value}
                        onClick={() => handleMultipleToggle(currentQuestion, option.value)}
                        className={`w-full px-4 py-3 text-left rounded-xl border-2 transition-all flex items-center gap-3 ${
                          selected
                            ? 'border-copper-500 bg-copper-50 text-navy-900 shadow-sm'
                            : 'border-gray-200 hover:border-copper-300 hover:bg-gray-50 text-navy-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                            selected ? 'border-copper-500 bg-copper-500' : 'border-gray-300'
                          }`}
                        >
                          {selected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-base">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === 'number' && (
                <div>
                  <input
                    type="number"
                    placeholder={currentQuestion.placeholder}
                    value={responses[currentQuestion.key] ?? ''}
                    onChange={(e) => handleNumberChange(currentQuestion, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return;

                      const rawValue = e.currentTarget.value;
                      const hasValue =
                        rawValue !== '' &&
                        rawValue !== undefined &&
                        rawValue !== null &&
                        !Number.isNaN(Number(rawValue));

                      if (!hasValue) return;

                      e.preventDefault();

                      if (currentStep === totalSteps - 1) {
                        submitAssessment();
                      } else {
                        nextStep();
                      }
                    }}
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-copper-500 focus:outline-none focus:ring-4 focus:ring-copper-100 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter a number and press Enter to continue.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    currentStep === 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-navy-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>

                {currentStep === totalSteps - 1 ? (
                  <button
                    onClick={submitAssessment}
                    disabled={isSubmitting || !canProceed()}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                      canProceed() && !isSubmitting
                        ? 'bg-copper-600 text-white hover:bg-copper-700 shadow-sm'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Calculating...' : 'See My Results'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                      canProceed()
                        ? 'bg-copper-600 text-white hover:bg-copper-700 shadow-sm'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {previewReport && (
        <div className="fixed bottom-4 left-0 right-0 px-4 pointer-events-none">
          <div className="max-w-3xl mx-auto rounded-2xl border border-[#d8e2ec] bg-white/95 backdrop-blur shadow-lg p-4 pointer-events-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Current Score:{' '}
                <span className="font-bold text-navy-900">{previewReport.foundationScore}</span>
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded ${getScoreBand(previewReport.foundationScore).bg} ${getScoreBand(previewReport.foundationScore).color}`}
                >
                  {getScoreBand(previewReport.foundationScore).label}
                </span>
              </div>
              <div className="text-sm text-gray-500 text-right">
                {LIFE_STAGE_LABELS[previewReport.lifeStage]}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FreeReportResults({
  reportData,
  onUpgrade,
  onRetake,
}: FreeReportResultsProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fafc_0%,#eef4f8_100%)]">
      <header className="bg-navy-900 text-white py-10 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <img src={logoImage} alt="A Wealthy Foundation" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold mb-2">Your Foundation Score</h1>
          <p className="text-navy-300">A personalized financial snapshot</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-copper-100 mb-4 shadow-inner">
              <span className="text-4xl font-bold text-copper-600">{reportData.foundationScore}</span>
            </div>
            <h2 className={`text-2xl font-bold ${getScoreBand(reportData.foundationScore).color}`}>
              {getScoreBand(reportData.foundationScore).label}
            </h2>
            <p className="text-gray-600 mt-2">{LIFE_STAGE_LABELS[reportData.lifeStage]} Stage</p>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-navy-900">Your 7 Pillars</h3>
            {Object.entries(reportData.pillarScores).map(([pillar, score]: [string, number]) => (
              <div key={pillar}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-navy-700">
                    {PILLAR_LABELS[pillar as PillarKey]}
                  </span>
                  <span className="text-gray-600">{score}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-copper-600" />
            Your Key Insights
          </h3>
          <ul className="space-y-3">
            {reportData.insights.map((insight: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                {insight}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-copper-600" />
            Your Top Priorities
          </h3>
          <ul className="space-y-3">
            {reportData.priorities.map((priority: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <span className="w-6 h-6 rounded-full bg-copper-100 text-copper-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {i + 1}
                </span>
                {priority}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Want your full financial diagnostic?</h3>
          <p className="text-navy-200 mb-4">
            Upgrade to the Detailed Assessment for a deeper breakdown, more personalized
            recommendations, and a stronger action plan.
          </p>
          <button
            onClick={onUpgrade}
            className="inline-flex items-center gap-2 px-6 py-3 bg-copper-600 text-white rounded-xl font-bold hover:bg-copper-700 transition-colors"
          >
            Upgrade to Detailed Assessment
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button onClick={onRetake} className="text-navy-700 font-medium hover:text-copper-600">
            Retake Assessment
          </button>
          {isAuthenticated && (
            <button
              onClick={() => navigate('/my-foundation')}
              className="text-copper-600 font-medium hover:text-copper-700"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
