import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle,
  Calculator,
  X,
  Home,
  ArrowRight,
  TrendingUp,
  PiggyBank,
  CreditCard,
  DollarSign,
  Eye,
  Users,
  Info,
} from 'lucide-react';
import {
  DETAILED_ASSESSMENT_QUESTIONS,
  generateReport,
  BUILDING_BLOCK_LABELS,
  getVisibleQuestions,
  getMilestonesForStage,
  type BuildingBlockKey,
  type Question,
} from '../types/assessment';

import { useAppStore } from '../store/appStore';

const SECTION_ICONS: Record<string, React.ElementType> = {
  income: DollarSign,
  spending: CreditCard,
  saving: PiggyBank,
  debt: CreditCard,
  protection: Shield,
  investing: TrendingUp,
  vision: Eye,
};

const SECTIONS = [
  { id: 'income', label: 'Income', icon: DollarSign },
  { id: 'spending', label: 'Spending', icon: CreditCard },
  { id: 'saving', label: 'Saving', icon: PiggyBank },
  { id: 'debt', label: 'Debt', icon: CreditCard },
  { id: 'protection', label: 'Protection', icon: Shield },
  { id: 'investing', label: 'Investing', icon: TrendingUp },
  { id: 'vision', label: 'Vision', icon: Eye },
  { id: 'context', label: 'About You', icon: Users },
];

type ResponseValue = string | string[] | number;

export default function ComprehensiveQuestionnaire() {
  const navigate = useNavigate();
  const { isAuthenticated, saveAssessment, setCurrentAssessment } = useAppStore();

  const questions = DETAILED_ASSESSMENT_QUESTIONS;

  const [currentStep, setCurrentStep] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const [hasSeenInfo, setHasSeenInfo] = useState(false);
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [visibleQuestions, setVisibleQuestions] = useState(() =>
    getVisibleQuestions(questions, {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorValue, setCalculatorValue] = useState('');

  const nextButtonRef = useRef<HTMLButtonElement | null>(null);

  const totalSteps = visibleQuestions.length;
  const currentQuestion = visibleQuestions[currentStep];
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  useEffect(() => {
    setInfoOpen(false);
  }, [currentQuestion?.key]);

  const currentSection =
    SECTIONS.find((section) => section.id === currentQuestion?.section) || SECTIONS[0];

  const shouldAutoAdvance = (question: Question) => {
    return question.type === 'single' || question.type === 'scale';
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

  const updateResponses = (key: string, value: ResponseValue) => {
    const updated = { ...responses, [key]: value };
    const filtered = getVisibleQuestions(questions, updated);

    setResponses(updated);
    setVisibleQuestions(filtered);

    if (currentStep >= filtered.length) {
      setCurrentStep(Math.max(0, filtered.length - 1));
    }

    return { updated, filtered };
  };

  const openCalculator = () => {
    if (!currentQuestion) return;
    setCalculatorValue(String(responses[currentQuestion.key] ?? ''));
    setCalculatorOpen(true);
  };

  const applyCalculatorValue = () => {
    if (!currentQuestion) return;

    try {
      const evaluated = Function('"use strict"; return (' + calculatorValue + ')')();
      const numValue = Number(evaluated);

      if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
        updateResponses(currentQuestion.key, numValue);
      }
    } catch {
      const numValue = parseFloat(calculatorValue);
      if (!Number.isNaN(numValue)) {
        updateResponses(currentQuestion.key, numValue);
      }
    }

    setCalculatorOpen(false);
    nextButtonRef.current?.focus();
  };

  const nextStep = () => {
    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }
  };

  const handleResponse = (question: Question, value: ResponseValue) => {
    updateResponses(question.key, value);

    if (shouldAutoAdvance(question) && isQuestionAnswered(question, value)) {
      setTimeout(() => {
        nextStep();
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

  const handleNumberKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    question: Question
  ) => {
    if (e.key === 'Enter' && isQuestionAnswered(question, responses[question.key])) {
      nextStep();
    }
  };

  const canProceed = () => {
    return isQuestionAnswered(
      currentQuestion,
      currentQuestion ? responses[currentQuestion.key] : undefined
    );
  };

  const goToSection = (sectionId: string) => {
    const targetIndex = visibleQuestions.findIndex((q) => q.section === sectionId);
    if (targetIndex !== -1) {
      setCurrentStep(targetIndex);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);

    try {
      const report = generateReport(responses, 'detailed');
      console.log('SETTING CURRENT ASSESSMENT');
      console.log('REPORT GENERATED', report);

      setCurrentAssessment(report);

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
          milestonesCompleted,
          nextMilestones: getMilestonesForStage(report.lifeStage)
            .filter((m) => !milestonesCompleted.includes(m.id))
            .slice(0, 3)
            .map((m) => m.id),
        });
      }

      navigate('/results');
      console.log('NAVIGATING TO RESULTS');
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/my-foundation')}
                className="text-sm text-copper-600 font-medium"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-navy-700">
              Detailed Assessment
            </span>
            <span className="text-sm text-gray-500">
              {currentStep + 1} of {totalSteps}
            </span>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-copper-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {SECTIONS.map((section, idx) => {
              const Icon = section.icon;
              const currentSectionIndex = SECTIONS.findIndex(
                (s) => s.id === currentSection.id
              );
              const isActive = currentSection.id === section.id;
              const isComplete = idx < currentSectionIndex;

              return (
                <button
                  key={section.id}
                  onClick={() => goToSection(section.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-copper-100 text-copper-700'
                      : isComplete
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 py-6">
        <div className="max-w-2xl mx-auto px-4">
          {currentQuestion && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 min-h-[68vh] flex flex-col justify-between">
              <div>
                {currentQuestion.section && (
                  <div className="flex items-center gap-2 mb-4">
                    {(() => {
                      const Icon = SECTION_ICONS[currentQuestion.section];
                      return Icon ? <Icon className="w-4 h-4 text-copper-600" /> : null;
                    })()}
                    <span className="text-xs font-medium text-copper-600 uppercase tracking-wide">
                      {BUILDING_BLOCK_LABELS[currentQuestion.section as BuildingBlockKey]}
                    </span>
                  </div>
                )}

<div className="flex items-start gap-3 mb-5">
  <h2 className="text-xl md:text-2xl font-bold text-navy-900 leading-tight flex-1">
    {currentQuestion.question}
  </h2>

  {currentQuestion.helperText && (
    <button
      type="button"
      onClick={() => {
        setInfoOpen(true);
        setHasSeenInfo(true);
      }}
      className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:border-copper-400 hover:text-copper-600 transition-colors"
      title="More info"
      aria-label="More info"
    >
      <Info className="w-4 h-4" />
    </button>
  )}
</div>

  
                {currentQuestion.type === 'single' && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleResponse(currentQuestion, option.value)}
                        className={`w-full p-3 text-left text-[15px] rounded-xl border-2 transition-all ${
                          responses[currentQuestion.key] === option.value
                            ? 'border-copper-500 bg-copper-50 text-navy-900'
                            : 'border-gray-200 hover:border-copper-300 text-navy-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'multiple' && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option) => {
                      const selected = Array.isArray(responses[currentQuestion.key])
                        ? (responses[currentQuestion.key] as string[]).includes(option.value)
                        : false;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleMultipleToggle(currentQuestion, option.value)}
                          className={`w-full p-3 text-left text-[15px] rounded-xl border-2 transition-all flex items-center gap-3 ${
                            selected
                              ? 'border-copper-500 bg-copper-50 text-navy-900'
                              : 'border-gray-200 hover:border-copper-300 text-navy-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selected
                                ? 'border-copper-500 bg-copper-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {selected && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === 'number' && (
                  <div>
                  

                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder={currentQuestion.placeholder}
                        value={responses[currentQuestion.key] ?? ''}
                        onChange={(e) =>
                          handleNumberChange(currentQuestion, e.target.value)
                        }
                        onKeyDown={(e) => handleNumberKeyDown(e, currentQuestion)}
                        className="w-full p-3 text-lg border-2 border-gray-200 rounded-xl focus:border-copper-500 focus:outline-none pr-12"
                      />


                      <button
                        type="button"
                        onClick={openCalculator}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-copper-600 transition-colors"
                        title="Use calculator"
                      >
                        <Calculator className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
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
                    ref={nextButtonRef}
                    type="button"
                    onClick={submitAssessment}
                    disabled={isSubmitting || !canProceed()}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold ${
                      canProceed()
                        ? 'bg-copper-600 text-white hover:bg-copper-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Generating Report...' : 'See My Detailed Report'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    ref={nextButtonRef}
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold ${
                      canProceed()
                        ? 'bg-copper-600 text-white hover:bg-copper-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      {infoOpen && currentQuestion?.helperText && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
      <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-navy-900">
  {currentQuestion.key === 'threeMonthReview'
    ? 'What is a 3-Month Spending Review?'
    : currentQuestion.question}
</h3>
<button
  type="button"
  onClick={() => {
    setInfoOpen(true);
    setHasSeenInfo(true);
  }}
  className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:border-copper-500 hover:text-copper-600 hover:bg-copper-50 transition-all duration-200 group ${
    !hasSeenInfo ? 'animate-pulse' : ''
  }`}
  title="More info"
  aria-label="More info"
>
  <Info className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
</button>
      </div>

      <p className="text-gray-700 leading-7">
        {currentQuestion.helperText}
      </p>

      {currentQuestion.key === 'threeMonthReview' && (
        <div className="mt-4 space-y-3 text-gray-700 leading-7">
          <p>
            A 3-month spending review means looking back at the last 3 months of
            your bank and card transactions to see exactly where your money has
            been going.
          </p>
          <p>
            You are not trying to judge yourself. You are trying to get clear.
          </p>
          <ul className="space-y-2 pl-5 list-disc">
            <li>spot money leaks</li>
            <li>see patterns you may have missed</li>
            <li>understand what is actually happening, not just what you think is happening</li>
          </ul>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => setInfoOpen(false)}
          className="px-5 py-2.5 bg-copper-600 text-white rounded-xl font-semibold hover:bg-copper-700"
        >
          Got it
        </button>
      </div>
    </div>
  </div>
)}
      {calculatorOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900">Calculator</h3>
              <button
                type="button"
                onClick={() => setCalculatorOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={calculatorValue}
              onChange={(e) => setCalculatorValue(e.target.value)}
              className="w-full p-3 text-xl text-right border-2 border-gray-200 rounded-xl mb-4"
              placeholder="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyCalculatorValue();
              }}
            />

            <div className="grid grid-cols-4 gap-2 mb-4">
              {['7', '8', '9', '/'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCalculatorValue((prev) => prev + key)}
                  className="p-3 text-lg font-medium bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {key}
                </button>
              ))}
              {['4', '5', '6', '*'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCalculatorValue((prev) => prev + key)}
                  className="p-3 text-lg font-medium bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {key}
                </button>
              ))}
              {['1', '2', '3', '-'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCalculatorValue((prev) => prev + key)}
                  className="p-3 text-lg font-medium bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {key}
                </button>
              ))}
              {['0', '.', 'C', '+'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'C') setCalculatorValue('');
                    else setCalculatorValue((prev) => prev + key);
                  }}
                  className={`p-3 text-lg font-medium rounded-lg ${
                    key === 'C'
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={applyCalculatorValue}
              className="w-full py-3 bg-copper-600 text-white rounded-xl font-bold hover:bg-copper-700"
            >
              Apply Value
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
