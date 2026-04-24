import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppStore } from './store/appStore';
import { supabase } from './lib/supabase';
import { loadAssessmentsFromSupabase } from './services/assessmentService';
import { useHydrateProfile } from './hooks/useHydrateProfile';
import SnapshotResultsPage from './pages/SnapshotResultsPage';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SnapshotQuestionnaire from './pages/SnapshotQuestionnaire';
import ComprehensiveQuestionnaire from './pages/ComprehensiveQuestionnaire';
import ResultsPage from './pages/ResultsPage';
import ScheduleConsultation from './pages/ScheduleConsultation';
import PricingPage from './pages/PricingPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import NewArticlePage from './pages/NewArticlePage';
import FoundationScorePage from './pages/FoundationScorePage';
import PremiumPage from './pages/PremiumPage';
import BuildingBlocksPage from './pages/BuildingBlocksPage';
import FinancialPillarsPage from './pages/FinancialPillarsPage';
import NewsletterPage from './pages/NewsletterPage';
import FoundationToolsPage from './pages/FoundationToolsPage';
import FixedCostLoadPage from './pages/FixedCostLoadPage';
import MonthlyMarginPlannerPage from './pages/MonthlyMarginPlannerPage';
import DebtPressureCheckPage from './pages/DebtPressureCheckPage';
import MyFreedomDatePage from './pages/MyFreedomDatePage';
import Layout from './layouts/Layouts';
import EmergencyFundTargetPage from './pages/EmergencyFundTargetPage';


function App() {
  const {
    isAuthenticated,
    setCurrentAssessment,
    setAssessmentHistory,
    setAuth,
    setUser,
    setProfile,
    setUserPlan,
    setPremium,
  } = useAppStore();

  useHydrateProfile();

  const [authChecked, setAuthChecked] = useState(false);

  function buildCurrentAssessmentFromHistoryItem(item: any) {
    if (!item) return null;

    const pillarScores = item.pillarScores ?? {};
    const priorities = item.priorities ?? [];
    const insights = item.insights ?? [];

    const weakestPillar =
      Object.entries(pillarScores).length > 0
        ? (Object.entries(pillarScores).sort((a: any, b: any) => a[1] - b[1])[0]?.[0] ?? null)
        : null;

    const summary =
      item.overallScore >= 80
        ? 'Your foundation looks strong. The focus now is optimization and consistency.'
        : item.overallScore >= 60
          ? 'You have momentum, but a few weaker areas are still holding you back.'
          : item.overallScore >= 40
            ? 'You have some good pieces in place, but several gaps are still creating drag.'
            : 'Your foundation needs reinforcement before growth becomes the priority.';

    const nextStep =
      weakestPillar
        ? `Start with ${weakestPillar}. One focused improvement here should have the biggest ripple effect.`
        : 'Choose one next step and make progress this week.';

    return {
      id: item.id,
      createdAt: item.createdAt,
      foundationScore: item.overallScore,
      scoreBand: '',
      pillars: pillarScores,
      pillarScores,
      insights,
      priorities,
      topFocusAreas: priorities,
      summary,
      nextStep,
    };
  }

  async function hydrateAssessments() {
    try {
      const assessments = await loadAssessmentsFromSupabase();

      setAssessmentHistory(assessments);

      if (assessments.length > 0) {
        if (assessments[0]?.report) {
          setCurrentAssessment(assessments[0].report);
        } else {
          setCurrentAssessment(buildCurrentAssessmentFromHistoryItem(assessments[0]));
        }
      } else {
        setCurrentAssessment(null);
      }
    } catch (error) {
      console.error('Assessment load failed:', error);
      setAssessmentHistory([]);
      setCurrentAssessment(null);
    }
  }

  useEffect(() => {
    // Let useHydrateProfile own auth/session hydration.
    // App.tsx should only react to the authenticated state and hydrate assessments.
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    async function runHydration() {
      if (!isAuthenticated) {
        setAssessmentHistory([]);
        setCurrentAssessment(null);
        return;
      }
  
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      if (!session?.user) {
        return;
      }
  
      await hydrateAssessments();
    }
  
    runHydration();
  }, [isAuthenticated]);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAuth(false, false);
      setUser(null);
      setProfile(null);
      setUserPlan('free');
      setPremium(false);
      setCurrentAssessment(null);
      setAssessmentHistory([]);
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />

          <Route path="/building-blocks" element={<BuildingBlocksPage />} />
          <Route path="/financial-pillars" element={<FinancialPillarsPage />} />
          <Route path="/foundation-score" element={<FoundationScorePage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/newsletter" element={<NewsletterPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/new" element={<NewArticlePage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
          <Route path="/foundation-tools" element={<FoundationToolsPage />} />
          <Route path="/foundation-tools/fixed-cost-load" element={<FixedCostLoadPage />} />
          <Route path="/foundation-tools/monthly-margin-planner" element={<MonthlyMarginPlannerPage />} />
          <Route path="/foundation-tools/debt-pressure-check" element={<DebtPressureCheckPage />} />
          <Route path="/foundation-tools/my-freedom-date" element={<MyFreedomDatePage />} />
          <Route path="/tools/emergency-fund-target" element={<EmergencyFundTargetPage />} />
          <Route path="/results/snapshot" element={<SnapshotResultsPage />} />

          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/my-foundation" replace /> : <LoginPage />
            }
          />

          <Route
            path="/my-foundation"
            element={
              isAuthenticated ? (
                <DashboardPage onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/assessment/snapshot"
            element={isAuthenticated ? <SnapshotQuestionnaire /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/assessment/comprehensive"
            element={isAuthenticated ? <ComprehensiveQuestionnaire /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/results"
            element={isAuthenticated ? <ResultsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/consultation"
            element={isAuthenticated ? <ScheduleConsultation /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/pricing"
            element={isAuthenticated ? <PricingPage /> : <Navigate to="/login" replace />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
