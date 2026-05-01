export type MomentumAction = {
    id: string;
    title: string;
    completed?: boolean;
    completedAt?: string | null;
    dueDate?: string | null;
    pillar?: string;
  };
  
  export type MomentumStatus = 'strong' | 'building' | 'at_risk' | 'stalled';
  
  export type MomentumSummary = {
    weeklyCompleted: number;
    weeklyTotal: number;
    progressPercent: number;
    streakDays: number;
    status: MomentumStatus;
    headline: string;
    message: string;
    nextAction: MomentumAction | null;
  };
  
  function isThisWeek(dateString?: string | null) {
    if (!dateString) return false;
  
    const date = new Date(dateString);
    const now = new Date();
  
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
  
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
  
    return date >= start && date < end;
  }
  
  function calculateStreak(actions: MomentumAction[]) {
    const completedDates = actions
      .filter((a) => a.completed && a.completedAt)
      .map((a) => new Date(a.completedAt as string).toDateString());
  
    const uniqueDates = Array.from(new Set(completedDates));
  
    let streak = 0;
    const cursor = new Date();
  
    while (uniqueDates.includes(cursor.toDateString())) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  
    return streak;
  }
  
  export function getMomentumSummary(actions: MomentumAction[]): MomentumSummary {
    const weeklyActions = actions.filter((a) => {
      if (a.completedAt && isThisWeek(a.completedAt)) return true;
      if (a.dueDate && isThisWeek(a.dueDate)) return true;
      return false;
    });
  
    const weeklyCompleted = weeklyActions.filter((a) => a.completed).length;
    const weeklyTotal = Math.max(weeklyActions.length, 1);
    const progressPercent = Math.round((weeklyCompleted / weeklyTotal) * 100);
    const streakDays = calculateStreak(actions);
  
    const nextAction =
      actions.find((a) => !a.completed && a.dueDate && isThisWeek(a.dueDate)) ||
      actions.find((a) => !a.completed) ||
      null;
  
    let status: MomentumStatus = 'building';
  
    if (weeklyCompleted >= 3 || progressPercent >= 75) {
      status = 'strong';
    } else if (weeklyCompleted === 0 && weeklyActions.length > 0) {
      status = 'at_risk';
    } else if (actions.length > 0 && actions.every((a) => !a.completed)) {
      status = 'stalled';
    }
  
    const copy = {
      strong: {
        headline: 'Your momentum is strong',
        message: 'You are stacking small wins. Keep the rhythm going this week.',
      },
      building: {
        headline: 'You are building momentum',
        message: 'One or two focused actions this week can keep your plan moving.',
      },
      at_risk: {
        headline: 'Your momentum needs attention',
        message: 'A small action today can get you back on track.',
      },
      stalled: {
        headline: 'Your plan is ready for action',
        message: 'Start with one simple move. The goal is progress, not perfection.',
      },
    };
  
    return {
      weeklyCompleted,
      weeklyTotal,
      progressPercent,
      streakDays,
      status,
      headline: copy[status].headline,
      message: copy[status].message,
      nextAction,
    };
  }