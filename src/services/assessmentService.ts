import { supabase } from '../lib/supabase';

export async function loadAssessmentsFromSupabase() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
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
    createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
    updatedAt: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
    buildingBlockScores: item.building_block_scores ?? {},
    pillarScores: item.pillar_scores ?? {},
    lifeStage: item.life_stage,
    insights: item.insights ?? [],
    priorities: item.priorities ?? [],
    milestonesCompleted: item.milestones_completed ?? [],
    nextMilestones: item.next_milestones ?? [],

    report: item.report
    
  }));
}