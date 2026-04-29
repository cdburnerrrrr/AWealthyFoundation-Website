import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/appStore';

export async function loadAssessmentsFromSupabase() {
  try {
    // ✅ Get user from Supabase session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;

    if (!userId) return [];

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load error:', error);
      return [];
    }

    return (data ?? []).map((item) => ({
      id: item.id,
      userId: item.user_id,
      assessmentType: item.assessment_type,
      overallScore: item.overall_score,
      createdAt: item.created_at
        ? new Date(item.created_at).getTime()
        : Date.now(),
      updatedAt: item.created_at
        ? new Date(item.created_at).getTime()
        : Date.now(),
      buildingBlockScores: item.building_block_scores ?? {},
      pillarScores: item.pillar_scores ?? {},
      lifeStage: item.life_stage,
      insights: item.insights ?? [],
      priorities: item.priorities ?? [],
      milestonesCompleted: item.milestones_completed ?? [],
      nextMilestones: item.next_milestones ?? [],
      answers: item.answers ?? {},
      summary: item.report?.summary ?? item.summary ?? '',
      nextStep: item.report?.nextStep ?? item.next_step ?? '',
      actionPlan: item.report?.actionPlan ?? item.action_plan ?? null,
      structuralWarnings: item.report?.structuralWarnings ?? [],
      report: item.report,
    }));
  } catch (err) {
    console.error('Assessment load failed:', err);
    return [];
  }
}