export type PremiumPillarKey =
  | 'income'
  | 'spending'
  | 'saving'
  | 'investing'
  | 'debt'
  | 'protection'
  | 'vision';

export type PremiumPillarScores = Record<PremiumPillarKey, number>;

export type PriorityLadder = {
  now: PremiumPillarKey[];
  next: PremiumPillarKey[];
  later: PremiumPillarKey[];
};

export type RoadmapQuarter = {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  title: string;
  mainFocus: string;
  actions: string[];
  checkpoint: string;
};

export type WorkbookExercise = {
  pillar: PremiumPillarKey;
  title: string;
  prompt: string;
};

const PILLAR_LABELS: Record<PremiumPillarKey, string> = {
  income: 'Income',
  spending: 'Spending',
  saving: 'Saving',
  investing: 'Investing',
  debt: 'Debt Pressure',
  protection: 'Protection',
  vision: 'Vision',
};

export function pillarLabel(pillar: PremiumPillarKey): string {
  return PILLAR_LABELS[pillar];
}

export function normalizePremiumPillarScores(
  raw: Record<string, number>
): PremiumPillarScores {
  return {
    income: Number(raw.income ?? 0),
    spending: Number(raw.spending ?? 0),
    saving: Number(raw.saving ?? 0),
    investing: Number(raw.investing ?? 0),
    debt: Number(raw.debt ?? 0),
    protection: Number(raw.protection ?? 0),
    vision: Number(raw.vision ?? 0),
  };
}

export function rankPillars(scores: PremiumPillarScores): PremiumPillarKey[] {
  return (Object.entries(scores) as [PremiumPillarKey, number][])
    .sort((a, b) => a[1] - b[1])
    .map(([pillar]) => pillar);
}

export function getWeakestPillars(
  scores: PremiumPillarScores,
  count = 3
): PremiumPillarKey[] {
  return rankPillars(scores).slice(0, count);
}

export function getStrongestPillar(scores: PremiumPillarScores): PremiumPillarKey {
  return [...rankPillars(scores)].reverse()[0];
}

export function getPriorityLadder(scores: PremiumPillarScores): PriorityLadder {
  const ranked = rankPillars(scores);

  return {
    now: ranked.slice(0, 2),
    next: ranked.slice(2, 4),
    later: ranked.slice(4, 7),
  };
}

export function getBiggestConstraintText(weakest: PremiumPillarKey): string {
  switch (weakest) {
    case 'spending':
      return 'Too much money may be getting absorbed before it can be redirected toward stronger goals.';
    case 'debt':
      return 'Debt pressure may be reducing flexibility and slowing progress across the rest of the foundation.';
    case 'saving':
      return 'A weak cash buffer may be making every setback feel bigger than it needs to be.';
    case 'income':
      return 'Income may be limiting how quickly the rest of the system can improve.';
    case 'investing':
      return 'Long-term growth may not yet be compounding as consistently as it could.';
    case 'protection':
      return 'A gap in protection could leave too much of your progress exposed.';
    case 'vision':
      return 'Unclear direction may be making otherwise good money decisions feel disconnected.';
    default:
      return 'The weakest part of the foundation is still creating unnecessary friction.';
  }
}

export function getStrongestAdvantageText(strongest: PremiumPillarKey): string {
  switch (strongest) {
    case 'income':
      return 'Income strength gives you leverage if you direct it intentionally.';
    case 'spending':
      return 'You appear to have stronger day-to-day money control than many people.';
    case 'saving':
      return 'Your savings habits are already creating resilience you can build on.';
    case 'investing':
      return 'You have a real long-term wealth-building advantage to keep reinforcing.';
    case 'debt':
      return 'Debt pressure appears more manageable than your weaker areas.';
    case 'protection':
      return 'Your protection layer looks stronger than average and helps reduce fragility.';
    case 'vision':
      return 'You seem to have more direction than many people at this stage.';
    default:
      return 'You already have a meaningful strength that can help support progress elsewhere.';
  }
}

export function get12MonthFocusText(weakest: PremiumPillarKey): string {
  switch (weakest) {
    case 'spending':
      return 'Create breathing room by reducing leaks and improving spending clarity.';
    case 'debt':
      return 'Lower debt pressure and reclaim monthly cash flow.';
    case 'saving':
      return 'Build a stronger emergency buffer so progress is not constantly interrupted.';
    case 'income':
      return 'Increase income capacity or improve margin to support everything else.';
    case 'investing':
      return 'Turn short-term stability into long-term wealth-building consistency.';
    case 'protection':
      return 'Close the most important protection gaps before they become setbacks.';
    case 'vision':
      return 'Translate broad intentions into a clear 12-month direction.';
    default:
      return 'Strengthen the weakest part of the foundation first.';
  }
}

export function getLikelyBreakthroughText(weakest: PremiumPillarKey): string {
  switch (weakest) {
    case 'spending':
      return 'You could finally feel more in control of your month instead of reacting to it.';
    case 'debt':
      return 'You could create visible momentum and reduce stress faster than expected.';
    case 'saving':
      return 'You could stop smaller emergencies from derailing bigger progress.';
    case 'income':
      return 'You could create enough margin to move multiple pillars forward at once.';
    case 'investing':
      return 'You could shift from maintenance into real compounding momentum.';
    case 'protection':
      return 'You could make your financial life meaningfully more resilient.';
    case 'vision':
      return 'You could make decisions with more confidence because they connect to a clear target.';
    default:
      return 'You could make faster progress with less friction.';
  }
}

function getQuarterActions(pillar: PremiumPillarKey): string[] {
  switch (pillar) {
    case 'income':
      return [
        'Identify one realistic income-growth move to test.',
        'Look for the highest-leverage path: raise pay, grow hours, improve role fit, or add side income.',
        'Set one measurable monthly income target.',
      ];
    case 'spending':
      return [
        'Review recent spending and identify the biggest recurring leaks.',
        'Cut or reduce 1–2 drains that are crowding out real priorities.',
        'Create a simpler monthly awareness system you will actually use.',
      ];
    case 'saving':
      return [
        'Set a realistic emergency buffer target.',
        'Automate the first savings transfer, even if it starts small.',
        'Protect savings from being blended into day-to-day spending.',
      ];
    case 'investing':
      return [
        'Review contribution consistency and current automation.',
        'Increase investing only if your weaker bottlenecks are not starving the system.',
        'Set one contribution habit you can sustain.',
      ];
    case 'debt':
      return [
        'Choose one debt target instead of spreading effort everywhere.',
        'Direct freed-up cash flow intentionally.',
        'Track visible progress against one payoff priority.',
      ];
    case 'protection':
      return [
        'Review the biggest risk exposures first.',
        'Close the most important gap this quarter.',
        'Put one basic backup or protection system in place.',
      ];
    case 'vision':
      return [
        'Define what real progress should look like 12 months from now.',
        'Choose one concrete target worth organizing around.',
        'Write down why this target matters now.',
      ];
    default:
      return [
        'Choose one high-impact action.',
        'Make it measurable.',
        'Revisit it after 90 days.',
      ];
  }
}

function getCheckpointQuestion(
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  pillar: PremiumPillarKey
): string {
  const label = pillarLabel(pillar);

  switch (quarter) {
    case 'Q1':
      return `Did I create more stability in ${label}, or am I still mostly reacting?`;
    case 'Q2':
      return `What specific proof do I have that ${label} is getting stronger?`;
    case 'Q3':
      return `Am I expanding from strength, or did the old bottleneck return in ${label}?`;
    case 'Q4':
      return 'Which progress is now repeatable enough to carry into next year?';
    default:
      return 'What changed this quarter?';
  }
}

export function getQuarterRoadmap(scores: PremiumPillarScores): RoadmapQuarter[] {
  const ranked = rankPillars(scores);
  const weakest = ranked[0];
  const second = ranked[1];
  const third = ranked[2];

  return [
    {
      quarter: 'Q1',
      title: 'Stabilize / Start',
      mainFocus: `Start with ${pillarLabel(weakest)}.`,
      actions: getQuarterActions(weakest),
      checkpoint: getCheckpointQuestion('Q1', weakest),
    },
    {
      quarter: 'Q2',
      title: 'Strengthen',
      mainFocus: `Reinforce ${pillarLabel(weakest)} and strengthen ${pillarLabel(second)}.`,
      actions: getQuarterActions(second),
      checkpoint: getCheckpointQuestion('Q2', second),
    },
    {
      quarter: 'Q3',
      title: 'Expand',
      mainFocus: `Build momentum into ${pillarLabel(third)}.`,
      actions: getQuarterActions(third),
      checkpoint: getCheckpointQuestion('Q3', third),
    },
    {
      quarter: 'Q4',
      title: 'Lock It In',
      mainFocus: 'Turn progress into repeatable habits and next-year clarity.',
      actions: [
        'Review the year and identify what actually moved the needle.',
        'Keep the systems that proved sustainable.',
        'Decide what your next bottleneck should be next year’s focus.',
      ],
      checkpoint: getCheckpointQuestion('Q4', weakest),
    },
  ];
}

export function getWorkbookExercises(
  scores: PremiumPillarScores
): WorkbookExercise[] {
  const weakest = getWeakestPillars(scores, 2);

  const map: Record<PremiumPillarKey, WorkbookExercise> = {
    spending: {
      pillar: 'spending',
      title: '3-Month Clarity Review',
      prompt:
        'Review the last 3 months and identify the categories or habits that created the most drift, friction, or regret.',
    },
    vision: {
      pillar: 'vision',
      title: '12-Month Focus Prompt',
      prompt:
        'Write what meaningful financial progress would look like by this time next year, and why it matters enough to prioritize now.',
    },
    debt: {
      pillar: 'debt',
      title: 'Debt Payoff Target Worksheet',
      prompt:
        'Choose the debt target that would create the biggest relief or momentum if reduced first.',
    },
    income: {
      pillar: 'income',
      title: 'Income Growth Brainstorm',
      prompt:
        'List 3 realistic ways to improve earnings, hours, role value, negotiation, or side income over the next 12 months.',
    },
    saving: {
      pillar: 'saving',
      title: 'Emergency Buffer Prompt',
      prompt:
        'Define the first emergency savings milestone that would make life feel noticeably safer.',
    },
    investing: {
      pillar: 'investing',
      title: 'Automation Upgrade Prompt',
      prompt:
        'Decide what contribution or automation change would make your investing more consistent.',
    },
    protection: {
      pillar: 'protection',
      title: 'Protection Gap Review',
      prompt:
        'List the 1–2 risks that could cause the biggest setback and decide which gap to close first.',
    },
  };

  return weakest.map((pillar) => map[pillar]);
}