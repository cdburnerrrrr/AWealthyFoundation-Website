import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppStore } from './store/appStore';
import { supabase } from './lib/supabase';
import { loadAssessmentsFromSupabase } from './services/assessmentService';

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
import TrustedExpertsPage from './pages/TrustedExpertsPage';
import Layout from './layouts/Layouts';

function App() {
  const {
    isAuthenticated,
    setAuth,
    setUser,
    setCurrentAssessment,
    setAssessmentHistory,
  } = useAppStore();

  const [authChecked, setAuthChecked] = useState(false);

  async function hydrateAssessments() {
    try {
      const assessments = await loadAssessmentsFromSupabase();

      setAssessmentHistory(assessments);

      if (assessments.length > 0) {
        setCurrentAssessment({
          foundationScore: assessments[0].overallScore,
          scoreBand: '',
          pillars: assessments[0].pillarScores,
          insights: assessments[0].insights,
          topFocusAreas: assessments[0].priorities,
        });
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
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuth(true, false);
        setUser({
          id: 0,
          userId: session.user.id,
          name: session.user.user_metadata?.name || null,
          email: session.user.email || null,
          isPremium: 0,
          subscriptionStatus: 'free',
          createdAt: null,
          updatedAt: null,
        });

        setAuthChecked(true);
        void hydrateAssessments();
      } else {
        setAuth(false, false);
        setUser(null);
        setCurrentAssessment(null);
        setAssessmentHistory([]);
        setAuthChecked(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setAuth(true, false);
        setUser({
          id: 0,
          userId: session.user.id,
          name: session.user.user_metadata?.name || null,
          email: session.user.email || null,
          isPremium: 0,
          subscriptionStatus: 'free',
          createdAt: null,
          updatedAt: null,
        });

        setAuthChecked(true);
        void hydrateAssessments();
        return;
      }

      setAuth(false, false);
      setUser(null);
      setCurrentAssessment(null);
      setAssessmentHistory([]);
      setAuthChecked(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuth(false, false);
      setUser(null);
      setCurrentAssessment(null);
      setAssessmentHistory([]);
      setAuthChecked(true);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAuth(false, false);
      setUser(null);
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
          <Route path="/trusted-experts" element={<TrustedExpertsPage />} />

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