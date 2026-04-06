import { supabase } from '../lib/supabase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Consultation, UserProfile, PillarKey, BuildingBlockKey, LifeStage } from '../types/assessment';

type CurrentAssessmentResult = {
  foundationScore: number;
  scoreBand: string;
  pillars: Record<string, number>;
  strengths?: { pillar: string; label: string; score: number }[];
  topFocusAreas?: string[];
  insights?: string[];
  summary?: string;
  nextStep?: string;
};

type AssessmentHistoryItem = {
  id: number;
  userId: string;
  assessmentType: 'free' | 'detailed' | 'premium';
  overallScore: number;
  createdAt: number;
  updatedAt: number;
  buildingBlockScores: Record<BuildingBlockKey, number>;
  pillarScores: Record<string, number>;
  lifeStage: LifeStage;
  insights?: string[];
  priorities?: string[];
  milestonesCompleted?: string[];
  nextMilestones?: string[];
};

interface SaveAssessmentInput {
  assessmentType: 'free' | 'detailed' | 'premium';
  overallScore: number;
  buildingBlockScores: Record<BuildingBlockKey, number>;
  pillarScores: Record<string, number>;
  lifeStage: LifeStage;
  insights?: string[];
  priorities?: string[];
  milestonesCompleted?: string[];
  nextMilestones?: string[];
  report?: any;
  summary?: string;
  nextStep?: string;
  actionPlan?: any;
}

interface AppState {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Auth
  isAuthenticated: boolean;
  isChecking: boolean;
  setAuth: (isAuthenticated: boolean, isChecking: boolean) => void;

  // Assessments
  currentAssessment: CurrentAssessmentResult | null;
  assessmentHistory: AssessmentHistoryItem[];
  setCurrentAssessment: (assessment: CurrentAssessmentResult | null) => void;
  addAssessmentToHistory: (assessment: AssessmentHistoryItem) => void;
  setAssessmentHistory: (assessments: AssessmentHistoryItem[]) => void;
  clearAssessmentHistory: () => void;
  saveAssessment: (input: SaveAssessmentInput) => Promise<AssessmentHistoryItem>;

  // Consultations
  consultations: Consultation[];
  setConsultations: (consultations: Consultation[]) => void;

  // UI State
  currentPillar: PillarKey | null;
  setCurrentPillar: (pillar: PillarKey | null) => void;

  // Premium
  isPremium: boolean;
  userPlan: 'free' | 'foundation' | 'roadmap';
  setPremium: (isPremium: boolean) => void;
  setUserPlan: (plan: 'free' | 'foundation' | 'roadmap') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Auth
      isAuthenticated: false,
      isChecking: true,
      setAuth: (isAuthenticated, isChecking) => set({ isAuthenticated, isChecking }),

      // Assessments
      currentAssessment: null,
      assessmentHistory: [],

      setCurrentAssessment: (assessment) => set({ currentAssessment: assessment }),

      addAssessmentToHistory: (assessment) => {
        const { assessmentHistory } = get();
        const newHistory = [assessment, ...assessmentHistory].slice(0, 50);

        // IMPORTANT:
        // Do NOT overwrite currentAssessment here.
        // currentAssessment is the new report/result shape used by /results.
        set({
          assessmentHistory: newHistory,
        });
      },

      saveAssessment: async (input: SaveAssessmentInput) => {
        const { user, addAssessmentToHistory } = get();
        const now = Date.now();
      
        if (!user) {
          throw new Error('User not authenticated');
        }
      
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser();
      
        if (!supabaseUser) {
          throw new Error('Supabase user not found');
        }
      
        // Save to Supabase
        const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_id: supabaseUser.id,
          assessment_type: input.assessmentType,
          overall_score: input.overallScore,
          building_block_scores: input.buildingBlockScores,
          pillar_scores: input.pillarScores,
          life_stage: input.lifeStage,
          insights: input.insights,
          priorities: input.priorities,
          milestones_completed: input.milestonesCompleted,
          next_milestones: input.nextMilestones,
          report: input.report ?? null,
        })
        .select()
        .single();
      
        if (error) {
          console.error('Supabase save error:', error);
          throw error;
        }
      
        // Convert to your local format
        const newAssessment: AssessmentHistoryItem = {
          id: now,
          userId: user.id?.toString() || supabaseUser.id,
          assessmentType: input.assessmentType,
          overallScore: input.overallScore,
          createdAt: now,
          updatedAt: now,
          buildingBlockScores: input.buildingBlockScores,
          pillarScores: input.pillarScores,
          lifeStage: input.lifeStage,
          insights: input.insights,
          priorities: input.priorities,
          milestonesCompleted: input.milestonesCompleted,
          nextMilestones: input.nextMilestones,
        };
      
        addAssessmentToHistory(newAssessment);
      
        return newAssessment;
      },

      setAssessmentHistory: (assessments) => set({ assessmentHistory: assessments }),

      clearAssessmentHistory: () =>
        set({
          assessmentHistory: [],
          currentAssessment: null,
        }),

      // Consultations
      consultations: [],
      setConsultations: (consultations) => set({ consultations }),

      // UI
      currentPillar: null,
      setCurrentPillar: (pillar) => set({ currentPillar: pillar }),

      // Premium
      isPremium: false,
      userPlan: 'free',
      setPremium: (isPremium) => set({ isPremium }),
      setUserPlan: (plan) => set({ userPlan: plan, isPremium: plan !== 'free' }),
    }),
    {
      name: 'wealthy-foundation-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentAssessment: state.currentAssessment,
        assessmentHistory: state.assessmentHistory,
        userPlan: state.userPlan,
      }),
    }
  )
);