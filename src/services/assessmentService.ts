import { supabase } from '../lib/supabase';

export async function loadAssessmentsFromSupabase() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Load error:', error);
    return [];
  }

  return data.map((item) => ({
    id: Date.now(),
    userId: item.user_id,
    assessmentType: item.assessment_type,
    overallScore: item.overall_score,
    createdAt: new Date(item.created_at).getTime(),
    updatedAt: new Date(item.created_at).getTime(),
    buildingBlockScores: item.building_block_scores,
    pillarScores: item.pillar_scores,
    lifeStage: item.life_stage,
    insights: item.insights,
    priorities: item.priorities,
    milestonesCompleted: item.milestones_completed,
    nextMilestones: item.next_milestones,
  }));
}