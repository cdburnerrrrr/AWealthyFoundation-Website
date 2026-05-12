export type BuildingBlockKey =
  | 'vision'
  | 'protection'
  | 'investing'
  | 'spending'
  | 'saving'
  | 'income'
  | 'debt';

export type ArticleSection = {
  heading: string;
  body: string[];
  bullets?: string[];
};

export type ArticleChartItem = {
  label: string;
  value: number;
  helper: string;
};

export type ArticleChart = {
  title: string;
  subtitle: string;
  items: ArticleChartItem[];
};

export type FoundationArticle = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  pillar: BuildingBlockKey;
  readTime: string;
  heroTitle: string;
  heroSubtitle: string;
  imageLabel: string;
  chart: ArticleChart;
  sections: ArticleSection[];
  takeaways: string[];
  relatedArticles: string[];
  source?: 'system' | 'custom';
  customHtml?: string;
  createdAt?: string;
};

export type BuildingBlockMeta = {
  id: BuildingBlockKey;
  name: string;
  strengthens: string;
  description: string;
  text: string;
  bg: string;
  border: string;
  ring: string;
  gradient: string;
  deepGradient: string;
  chart: string;
};

export const BUILDING_BLOCKS: BuildingBlockMeta[] = [
  {
    id: 'vision',
    name: 'Vision',
    strengthens: 'Direction',
    description: 'Clarify what your money is really supposed to support.',
    text: 'text-teal-600',
    bg: 'bg-teal-100',
    border: 'border-teal-200',
    ring: 'ring-teal-200/70',
    gradient: 'from-teal-100 via-white to-cyan-50',
    deepGradient: 'from-teal-500 to-cyan-500',
    chart: 'bg-teal-500',
  },
  {
    id: 'protection',
    name: 'Protection',
    strengthens: 'Security',
    description: 'Prepare for the unexpected before it becomes expensive.',
    text: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    ring: 'ring-blue-200/70',
    gradient: 'from-blue-100 via-white to-sky-50',
    deepGradient: 'from-blue-500 to-sky-500',
    chart: 'bg-blue-500',
  },
  {
    id: 'investing',
    name: 'Investing',
    strengthens: 'Growth',
    description: 'Turn present income into future options.',
    text: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-200',
    ring: 'ring-green-200/70',
    gradient: 'from-green-100 via-white to-emerald-50',
    deepGradient: 'from-green-500 to-emerald-500',
    chart: 'bg-green-500',
  },
  {
    id: 'spending',
    name: 'Spending',
    strengthens: 'Control',
    description: 'Create monthly breathing room without turning life into a spreadsheet.',
    text: 'text-amber-600',
    bg: 'bg-amber-100',
    border: 'border-amber-200',
    ring: 'ring-amber-200/70',
    gradient: 'from-amber-100 via-white to-yellow-50',
    deepGradient: 'from-amber-500 to-yellow-500',
    chart: 'bg-amber-500',
  },
  {
    id: 'saving',
    name: 'Saving',
    strengthens: 'Consistency',
    description: 'Build reserves that make life less reactive.',
    text: 'text-pink-500',
    bg: 'bg-pink-100',
    border: 'border-pink-200',
    ring: 'ring-pink-200/70',
    gradient: 'from-pink-100 via-white to-rose-50',
    deepGradient: 'from-pink-500 to-rose-500',
    chart: 'bg-pink-500',
  },
  {
    id: 'income',
    name: 'Income',
    strengthens: 'Clarity',
    description: 'Strengthen the engine that funds the rest of the foundation.',
    text: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-200',
    ring: 'ring-purple-200/70',
    gradient: 'from-purple-100 via-white to-violet-50',
    deepGradient: 'from-purple-500 to-violet-500',
    chart: 'bg-purple-500',
  },
  {
    id: 'debt',
    name: 'Debt',
    strengthens: 'Efficiency',
    description: 'Lower the drag that slows every other goal.',
    text: 'text-red-500',
    bg: 'bg-red-100',
    border: 'border-red-200',
    ring: 'ring-red-200/70',
    gradient: 'from-red-100 via-white to-orange-50',
    deepGradient: 'from-red-500 to-orange-500',
    chart: 'bg-red-500',
  },
];

export const BUILDING_BLOCK_META = BUILDING_BLOCKS.reduce(
  (acc, block) => {
    acc[block.id] = block;
    return acc;
  },
  {} as Record<BuildingBlockKey, BuildingBlockMeta>
);

export const ARTICLES: FoundationArticle[] = [
  {
    id: 'vision-planning-guide',
    title: 'Vision: The Guardrail for Better Money Decisions',
    excerpt:
      'Vision is not a soft idea. It is the filter that tells your income, spending, saving, and investing what they are supposed to support.',
    category: 'Vision',
    pillar: 'vision',
    readTime: '10 min read',
    heroTitle: 'What is all of this money supposed to make possible?',
    heroSubtitle:
      'A stronger financial foundation starts with a clearer target. Vision turns money from a pile of disconnected decisions into a system pointed at the life you actually want.',
    imageLabel: 'Direction Map',
    chart: {
      title: 'How clear direction changes the next dollar',
      subtitle: 'A simple example of how the same income can point in very different directions.',
      items: [
        { label: 'No clear target', value: 38, helper: 'More drift, fewer intentional tradeoffs' },
        { label: 'One 12-month priority', value: 68, helper: 'Spending and saving start to align' },
        { label: 'Written vision + milestones', value: 86, helper: 'Decisions become easier to repeat' },
      ],
    },
    sections: [
      {
        heading: 'Vision is the roofline of the financial house',
        body: [
          'A lot of people start with tactics. They ask which account to open, which debt to pay first, or which app to use. Those questions matter, but they work better after you know what the money is supposed to support.',
          'Vision is the reason behind the system. It may be freedom from a job that no longer fits, a paid-off home, a stronger family safety net, a business, travel, generosity, or the ability to help kids launch without sacrificing your own stability.',
        ],
      },
      {
        heading: 'The problem with vague goals',
        body: [
          'Vague goals are hard to defend. “I want to be better with money” sounds good, but it does not help when a purchase, upgrade, loan, or opportunity is sitting in front of you.',
          'A real vision gives your daily choices a job. Instead of asking whether you can afford something in isolation, you can ask whether it supports the life you said you were building.',
        ],
        bullets: [
          'Name the life outcome, not just the dollar amount.',
          'Choose one 12-month milestone that would prove progress.',
          'Use that milestone to judge spending, saving, debt, and investing choices.',
        ],
      },
      {
        heading: 'A practical way to write your vision',
        body: [
          'Start with a short sentence: “Money is here to help me build...” Then finish the sentence honestly. Do not write what sounds impressive. Write what would actually change your decisions.',
          'Then translate that sentence into three numbers: a cash target, a debt target, and a growth target. The vision gives direction. The numbers give traction.',
        ],
      },
      {
        heading: 'Vision should simplify, not complicate',
        body: [
          'The point is not to create a poster full of dreams and ignore reality. The point is to make reality easier to organize. If your vision is freedom, monthly margin matters. If your vision is family security, protection and savings matter. If your vision is work optionality, investing consistency matters.',
          'When the vision is clear, tradeoffs still require discipline, but they stop feeling random.',
        ],
      },
    ],
    takeaways: [
      'Vision turns money choices into a system instead of a collection of reactions.',
      'A useful vision should connect to practical 12-month milestones.',
      'The best vision statement makes tradeoffs easier to recognize.',
    ],
    relatedArticles: ['budget-that-actually-works', 'investing-beginners-guide'],
  },
  {
    id: 'emergency-fund-guide',
    title: 'Emergency Fund Target: How Much Cushion Is Enough?',
    excerpt:
      'A strong emergency fund is not just a random savings number. It is a protection layer sized to your actual household risk.',
    category: 'Protection',
    pillar: 'protection',
    readTime: '11 min read',
    heroTitle: 'Build a cash cushion that actually protects your household.',
    heroSubtitle:
      'Emergency savings is the first protection tool most families can control. The goal is not to hoard cash forever. The goal is to keep one surprise from turning into new debt or a full financial reset.',
    imageLabel: 'Safety Buffer',
    chart: {
      title: 'Emergency fund target by household risk',
      subtitle: 'Most people need a range, not one universal rule.',
      items: [
        { label: 'Stable income, low risk', value: 45, helper: '3 to 4 months of essential costs' },
        { label: 'Dependents or homeowner', value: 65, helper: '4 to 6 months creates better protection' },
        { label: 'Variable income', value: 88, helper: '6 to 9 months may be more realistic' },
      ],
    },
    sections: [
      {
        heading: 'An emergency fund is protection, not idle money',
        body: [
          'Emergency savings often gets described as boring. That is exactly why it works. It is not supposed to impress anyone. It is supposed to keep your financial house standing when something breaks.',
          'Without a cash cushion, even a small problem can become a debt problem. A car repair goes on a credit card. A medical bill turns into a payment plan. A short job interruption becomes a long recovery period.',
        ],
      },
      {
        heading: 'The right target depends on your risk',
        body: [
          'The old rule of thumb says three to six months of expenses. That is a useful starting point, but your real target depends on income stability, dependents, home maintenance risk, health expenses, and whether you have another income in the household.',
          'A renter with stable income and no dependents may not need the same cash reserve as a self-employed homeowner supporting a family. Both need protection, but the target should not be identical.',
        ],
        bullets: [
          'Start with one month of essential expenses if the current cushion is thin.',
          'Move toward three months once high-interest debt pressure is controlled.',
          'Use six months or more when income is variable or several people depend on one paycheck.',
        ],
      },
      {
        heading: 'Keep it separate and boring',
        body: [
          'The emergency fund should be accessible, but not too convenient. A high-yield savings account at a separate bank can be a good fit because the money is available when needed but not sitting in the same account as groceries and subscriptions.',
          'Avoid investing your emergency fund. Investments can be powerful for long-term growth, but emergencies rarely wait for the market to cooperate.',
        ],
      },
      {
        heading: 'Rebuilding matters as much as building',
        body: [
          'Using the fund is not failure. That is what it is for. The key is to have a rebuild rule before you need it. If the balance drops, temporarily redirect extra cash back into the emergency fund until the cushion is restored.',
          'That rhythm is what turns savings into a system instead of a one-time project.',
        ],
      },
    ],
    takeaways: [
      'Emergency savings is a protection layer, not leftover cash.',
      'The right target depends on household risk and income stability.',
      'Keep the money accessible, separate, and easy to rebuild after use.',
    ],
    relatedArticles: ['saving-strategies', 'debt-freedom-roadmap'],
  },
  {
    id: 'debt-freedom-roadmap',
    title: 'Debt Pressure: A Roadmap for Getting Your Cash Flow Back',
    excerpt:
      'Debt payoff is not just about balances. It is about reducing the monthly drag that keeps the rest of your foundation from getting stronger.',
    category: 'Debt',
    pillar: 'debt',
    readTime: '12 min read',
    heroTitle: 'Debt payoff works best when it creates breathing room.',
    heroSubtitle:
      'The right debt plan lowers pressure, builds momentum, and turns required payments back into usable monthly cash flow.',
    imageLabel: 'Payoff Path',
    chart: {
      title: 'Debt pressure before and after a focused plan',
      subtitle: 'The goal is not only a lower balance. It is a better monthly picture.',
      items: [
        { label: 'Scattered payments', value: 72, helper: 'Several minimums compete for margin' },
        { label: 'One focused target', value: 52, helper: 'Extra cash has a clear job' },
        { label: 'First payoff complete', value: 31, helper: 'Freed payment accelerates the next move' },
      ],
    },
    sections: [
      {
        heading: 'Start with the payment pressure',
        body: [
          'Debt gets discussed as a balance problem, but many households feel it first as a cash flow problem. A $7,000 balance is stressful, but the monthly payment is what squeezes groceries, savings, investing, and peace of mind.',
          'A good payoff plan should answer two questions: which debt should go first, and how will that payoff improve the monthly system?',
        ],
      },
      {
        heading: 'Choose a strategy you can repeat',
        body: [
          'The debt snowball focuses on the smallest balance first. The debt avalanche focuses on the highest interest rate first. Both can work. The best method is the one you will actually follow long enough to get results.',
          'If motivation is the problem, the snowball can be powerful. If interest cost is the problem and you are already disciplined, the avalanche may save more money.',
        ],
        bullets: [
          'List every debt with balance, rate, payment, and due date.',
          'Choose one target instead of spreading extra money everywhere.',
          'When one debt is gone, roll that payment into the next target.',
        ],
      },
      {
        heading: 'Do not drain the whole safety net',
        body: [
          'It can be tempting to use every dollar of savings to attack debt. That can backfire if one surprise expense sends you right back to credit cards.',
          'A starter emergency fund protects the plan. It keeps the payoff strategy from collapsing the first time life gets expensive.',
        ],
      },
      {
        heading: 'The payoff is more than zero debt',
        body: [
          'The real win is the monthly payment you get back. A paid-off credit card, personal loan, or car loan can become the funding source for emergency savings, investing, or a future goal.',
          'Debt freedom is not just the absence of debt. It is the return of choice.',
        ],
      },
    ],
    takeaways: [
      'Measure debt by payment pressure as well as total balance.',
      'Snowball and avalanche both work when used consistently.',
      'Keep a small safety net so payoff progress does not collapse after one surprise.',
    ],
    relatedArticles: ['budget-that-actually-works', 'emergency-fund-guide'],
  },
  {
    id: 'income-streams-diversify',
    title: 'Income: The Engine That Funds Every Other Block',
    excerpt:
      'More income is not the answer to everything, but a stronger income base can lift saving, debt payoff, investing, and protection at the same time.',
    category: 'Income',
    pillar: 'income',
    readTime: '10 min read',
    heroTitle: 'Income is the engine. Margin is what the engine creates.',
    heroSubtitle:
      'A stronger income plan is not only about chasing more money. It is about improving stability, earning power, and the amount of cash left after the basics are covered.',
    imageLabel: 'Income Engine',
    chart: {
      title: 'The same raise can do different jobs',
      subtitle: 'The highest-value use depends on the weakest part of the foundation.',
      items: [
        { label: 'Stabilize bills', value: 40, helper: 'Use new income to reduce pressure' },
        { label: 'Build cushion', value: 62, helper: 'Create a stronger savings floor' },
        { label: 'Invest for growth', value: 82, helper: 'Turn surplus into future options' },
      ],
    },
    sections: [
      {
        heading: 'Income is not just a number',
        body: [
          'Two households can earn the same amount and feel completely different. The difference is often stability, benefits, commute costs, debt payments, and how much income is left after fixed costs.',
          'That is why income should be measured by what it makes possible. A stronger income base should create more margin, not just a more expensive lifestyle.',
        ],
      },
      {
        heading: 'There are three income levers',
        body: [
          'The first lever is stability: making the income you already have more dependable. The second is growth: improving skills, roles, or compensation. The third is diversification: adding income sources carefully without burning out.',
          'Most people should not chase all three at once. Choose the lever that solves the current constraint.',
        ],
        bullets: [
          'Stability helps when income is unpredictable or seasonal.',
          'Growth helps when your skills or role are underpriced.',
          'Diversification helps when one income source creates too much risk.',
        ],
      },
      {
        heading: 'Avoid lifestyle creep on new income',
        body: [
          'The biggest danger of higher income is quietly raising expenses at the same speed. If every raise becomes a new payment, the foundation may not actually get stronger.',
          'Before a raise arrives, assign the first portion to a financial job: emergency fund, debt payoff, retirement contribution, or a specific goal.',
        ],
      },
      {
        heading: 'Income should reduce fragility',
        body: [
          'A strong income plan gives the rest of the foundation room to breathe. It funds the emergency fund, lowers debt pressure, supports insurance, and gives investing a consistent source of fuel.',
          'The goal is not to work forever. The goal is to use income to build options.',
        ],
      },
    ],
    takeaways: [
      'Income is strongest when it creates monthly margin.',
      'Focus on stability, growth, or diversification based on the current constraint.',
      'Assign new income before lifestyle creep claims it.',
    ],
    relatedArticles: ['spending-plan-that-works', 'investing-beginners-guide'],
  },
  {
    id: 'spending-plan-that-works',
    title: 'Spending Control Without Turning Life Into a Spreadsheet',
    excerpt:
      'A spending plan should create control and breathing room, not shame. The right system is simple enough to repeat when life gets busy.',
    category: 'Spending',
    pillar: 'spending',
    readTime: '9 min read',
    heroTitle: 'Control starts with knowing what is already spoken for.',
    heroSubtitle:
      'Spending is not only about coffee, subscriptions, and small leaks. The biggest pressure often comes from fixed costs that consume the month before it starts.',
    imageLabel: 'Cash Flow Map',
    chart: {
      title: 'A healthier monthly structure',
      subtitle: 'The exact numbers vary, but the pattern matters.',
      items: [
        { label: 'Fixed costs', value: 50, helper: 'Housing, utilities, childcare, required payments' },
        { label: 'Flexible spending', value: 25, helper: 'Food, gas, life, and choices' },
        { label: 'Progress money', value: 25, helper: 'Savings, investing, debt payoff, goals' },
      ],
    },
    sections: [
      {
        heading: 'Most budgets fail because they are too detailed',
        body: [
          'A budget that requires constant perfect tracking usually breaks as soon as life gets busy. The goal is not to categorize every dollar forever. The goal is to know where pressure is coming from and create a plan that can survive a normal month.',
          'Start with fixed costs. If housing, transportation, utilities, childcare, subscriptions, insurance, and required debt payments are too high, cutting small purchases will not solve the main problem.',
        ],
      },
      {
        heading: 'Separate fixed costs from flexible choices',
        body: [
          'Fixed costs are the bills that show up whether you are motivated or not. Flexible costs are the choices that move around. Progress money is the money assigned to saving, investing, debt payoff, or specific goals.',
          'This three-bucket view is easier to maintain than a complicated category list and makes the real issue visible quickly.',
        ],
        bullets: [
          'Add up fixed costs first and compare them to take-home pay.',
          'Set a realistic flexible spending number for the month.',
          'Automate the progress money before it becomes leftover money.',
        ],
      },
      {
        heading: 'The goal is margin, not restriction',
        body: [
          'A strong spending plan should create room to breathe. If every dollar is assigned so tightly that one grocery trip ruins the month, the plan is too fragile.',
          'Margin is what allows you to handle small surprises without creating new debt or abandoning the whole plan.',
        ],
      },
      {
        heading: 'Review patterns, not perfection',
        body: [
          'Do a monthly review instead of daily judgment. Ask what surprised you, which fixed cost felt too heavy, and whether your money moved toward the priority you chose.',
          'That kind of review builds control without turning money into a constant argument with yourself.',
        ],
      },
    ],
    takeaways: [
      'Start with fixed costs before obsessing over small purchases.',
      'Use three buckets: fixed costs, flexible spending, and progress money.',
      'The best spending plan is the one you can repeat.',
    ],
    relatedArticles: ['debt-freedom-roadmap', 'saving-strategies'],
  },
  {
    id: 'investing-beginners-guide',
    title: 'Investing: Turning Today’s Margin Into Future Freedom',
    excerpt:
      'Investing does not have to start with complexity. The foundation is consistency, time, and making sure the next dollar goes to the right place.',
    category: 'Investing',
    pillar: 'investing',
    readTime: '12 min read',
    heroTitle: 'Investing is how your foundation starts building upward.',
    heroSubtitle:
      'Saving protects the present. Investing gives future dollars a chance to grow. The goal is not to guess perfectly. The goal is to build a repeatable growth habit.',
    imageLabel: 'Growth Path',
    chart: {
      title: 'What usually moves investing results',
      subtitle: 'The controllable inputs matter more than trying to predict everything.',
      items: [
        { label: 'Time invested', value: 88, helper: 'More years gives compounding room' },
        { label: 'Contribution habit', value: 78, helper: 'Consistency beats occasional intensity' },
        { label: 'Return chasing', value: 42, helper: 'Important, but least controllable' },
      ],
    },
    sections: [
      {
        heading: 'Start with the habit before the complexity',
        body: [
          'Many people delay investing because they think they need to understand everything first. You should understand the basics, but you do not need to become a market expert to start building a simple, diversified habit.',
          'The first goal is consistency. A monthly contribution to a reasonable account and investment mix can do more than years of waiting for the perfect strategy.',
        ],
      },
      {
        heading: 'Use the obvious wins first',
        body: [
          'If your employer offers a match, that is usually one of the first investing opportunities to review. After that, the right order may include emergency savings, high-interest debt, HSA eligibility, Roth or traditional retirement accounts, and taxable investing.',
          'The next dollar should go where it strengthens the whole foundation, not just where it sounds sophisticated.',
        ],
        bullets: [
          'Capture employer match if cash flow allows it.',
          'Do not ignore high-interest debt or a thin emergency fund.',
          'Increase contribution rates gradually when the habit is stable.',
        ],
      },
      {
        heading: 'Diversification keeps the plan from depending on one guess',
        body: [
          'A diversified portfolio spreads risk across many companies, sectors, and sometimes asset types. That does not remove risk, but it prevents your future from depending entirely on one stock or one idea.',
          'For most people, simple and diversified is a better foundation than complex and fragile.',
        ],
      },
      {
        heading: 'Investing should connect back to vision',
        body: [
          'The numbers matter, but the purpose matters too. Investing is not only about a bigger account balance. It is about buying future flexibility, future choices, and eventually more control over your time.',
          'That is why the habit is worth building even before it feels dramatic.',
        ],
      },
    ],
    takeaways: [
      'Consistency is the first investing skill to build.',
      'Capture simple wins before adding complexity.',
      'Diversification and time are more reliable than prediction.',
    ],
    relatedArticles: ['income-streams-diversify', 'vision-planning-guide'],
  },
  {
    id: 'saving-strategies',
    title: 'Saving: Building Options Instead of Just Building a Balance',
    excerpt:
      'Saving is not deprivation. It is the block that creates options, lowers stress, and protects the rest of the plan from interruption.',
    category: 'Saving',
    pillar: 'saving',
    readTime: '9 min read',
    heroTitle: 'Savings gives the rest of your financial house room to breathe.',
    heroSubtitle:
      'A savings habit turns good intentions into available choices. It creates margin before life forces you to create margin through debt.',
    imageLabel: 'Reserve Tank',
    chart: {
      title: 'Savings milestones that change behavior',
      subtitle: 'Each milestone improves a different kind of confidence.',
      items: [
        { label: '$1,000 starter cushion', value: 35, helper: 'Prevents many small debt setbacks' },
        { label: 'One month of expenses', value: 58, helper: 'Creates short-term breathing room' },
        { label: 'Three to six months', value: 84, helper: 'Protects bigger disruptions' },
      ],
    },
    sections: [
      {
        heading: 'Savings is a decision buffer',
        body: [
          'When savings is thin, decisions get rushed. A surprise bill can force you into debt. A job issue can force you to accept the first option. A home or car repair can disrupt every other goal.',
          'Savings gives you time to choose instead of react. That is why it strengthens more than the bank balance.',
        ],
      },
      {
        heading: 'Give each savings dollar a job',
        body: [
          'A single pile of savings can get confusing. Emergency money, upcoming expenses, home repairs, travel, taxes, and opportunity funds should not all compete inside one vague account.',
          'You do not need dozens of accounts, but you do need labels. Labels protect the money from being used twice.',
        ],
        bullets: [
          'Emergency fund: true disruption protection.',
          'Sinking funds: known expenses that are irregular but predictable.',
          'Goal savings: specific priorities tied to your vision.',
        ],
      },
      {
        heading: 'Automate the minimum, then add extra manually',
        body: [
          'Automation works because it removes negotiation. Even a small automatic transfer builds the identity and rhythm of saving.',
          'When extra money appears, you can add more manually. The automatic amount is the floor. Windfalls and better months are the accelerator.',
        ],
      },
      {
        heading: 'Saving and investing are partners',
        body: [
          'Savings protects the short term. Investing grows the long term. Problems happen when savings is asked to do the job of investing forever, or investments are used as the emergency fund.',
          'A strong foundation gives each dollar the right time horizon.',
        ],
      },
    ],
    takeaways: [
      'Savings creates options and protects decisions from urgency.',
      'Separate emergency savings from known future expenses.',
      'Automation builds the floor; extra deposits accelerate the plan.',
    ],
    relatedArticles: ['emergency-fund-guide', 'spending-plan-that-works'],
  },
];

export const ARTICLE_ALIASES: Record<string, string> = {
  'budget-that-actually-works': 'spending-plan-that-works',
};

export const ARTICLE_CATEGORIES = ['All', ...BUILDING_BLOCKS.map((block) => block.name)];

export const CUSTOM_ARTICLES_STORAGE_KEY = 'awf_custom_articles_v1';
export const ARTICLE_ADMIN_EMAIL = 'jacksonpcr@gmail.com';

export type CustomArticleDraft = {
  title: string;
  excerpt: string;
  pillar: BuildingBlockKey;
  readTime: string;
  customHtml: string;
  imageLabel?: string;
};

export function isArticleAdminEmail(email: unknown) {
  return String(email ?? '').trim().toLowerCase() === ARTICLE_ADMIN_EMAIL;
}

export function slugifyArticleTitle(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);

  return base || `article-${Date.now()}`;
}

function normalizeCustomArticle(value: unknown): FoundationArticle | null {
  if (!value || typeof value !== 'object') return null;
  const article = value as Partial<FoundationArticle>;

  if (!article.id || !article.title || !article.excerpt || !article.pillar || !article.customHtml) {
    return null;
  }

  if (!BUILDING_BLOCK_META[article.pillar]) return null;

  const meta = BUILDING_BLOCK_META[article.pillar];

  return {
    id: String(article.id),
    title: String(article.title),
    excerpt: String(article.excerpt),
    category: meta.name,
    pillar: article.pillar,
    readTime: article.readTime || '8 min read',
    heroTitle: article.heroTitle || String(article.title),
    heroSubtitle:
      article.heroSubtitle ||
      `A practical guide for strengthening the ${meta.name} block in your financial foundation.`,
    imageLabel: article.imageLabel || `${meta.name} Guide`,
    chart:
      article.chart || {
        title: `${meta.name} in practice`,
        subtitle: 'Use this as a simple planning lens while reading the article.',
        items: [
          { label: 'Clarity', value: 45, helper: 'Understand the current situation' },
          { label: 'Structure', value: 68, helper: 'Create a repeatable system' },
          { label: 'Momentum', value: 84, helper: 'Turn the idea into action' },
        ],
      },
    sections:
      article.sections && article.sections.length
        ? article.sections
        : [
            {
              heading: 'Article Notes',
              body: ['This article was created in the A Wealthy Foundation article editor.'],
            },
          ],
    takeaways:
      article.takeaways && article.takeaways.length
        ? article.takeaways
        : [
            `This article strengthens the ${meta.name} building block.`,
            'The best article should lead to one clear next step.',
            'Review this topic again as your foundation changes.',
          ],
    relatedArticles: Array.isArray(article.relatedArticles) ? article.relatedArticles : [],
    source: 'custom',
    customHtml: String(article.customHtml),
    createdAt: article.createdAt || new Date().toISOString(),
  };
}

export function loadCustomArticles(): FoundationArticle[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(CUSTOM_ARTICLES_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeCustomArticle)
      .filter(Boolean) as FoundationArticle[];
  } catch (error) {
    console.error('Unable to load custom articles:', error);
    return [];
  }
}

export function getAllArticles() {
  const customArticles = loadCustomArticles();
  const customIds = new Set(customArticles.map((article) => article.id));
  return [...customArticles, ...ARTICLES.filter((article) => !customIds.has(article.id))];
}

export function saveCustomArticle(draft: CustomArticleDraft): FoundationArticle {
  if (typeof window === 'undefined') {
    throw new Error('Custom articles can only be saved in the browser.');
  }

  const existing = loadCustomArticles();
  const baseSlug = slugifyArticleTitle(draft.title);
  const existingIds = new Set([...existing.map((article) => article.id), ...ARTICLES.map((article) => article.id)]);
  let id = baseSlug;
  let suffix = 2;

  while (existingIds.has(id)) {
    id = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const meta = BUILDING_BLOCK_META[draft.pillar];
  const plainText = draft.customHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const firstSentence = plainText.split(/[.!?]\s+/)[0] || draft.excerpt;

  const article: FoundationArticle = {
    id,
    title: draft.title.trim(),
    excerpt: draft.excerpt.trim(),
    category: meta.name,
    pillar: draft.pillar,
    readTime: draft.readTime || '8 min read',
    heroTitle: draft.title.trim(),
    heroSubtitle: firstSentence,
    imageLabel: draft.imageLabel?.trim() || `${meta.name} Guide`,
    chart: {
      title: `${meta.name} action path`,
      subtitle: 'A simple visual model for turning the article into a next step.',
      items: [
        { label: 'Understand', value: 42, helper: 'Name the issue clearly' },
        { label: 'Structure', value: 66, helper: 'Create a simple system' },
        { label: 'Act', value: 88, helper: 'Choose the next move' },
      ],
    },
    sections: [
      {
        heading: 'Article Notes',
        body: ['This article was created in the A Wealthy Foundation article editor.'],
      },
    ],
    takeaways: [
      `This guide strengthens the ${meta.name} building block.`,
      'The most useful financial content should lead to one clear next action.',
      'Revisit the topic as your Foundation Score and dashboard change.',
    ],
    relatedArticles: [],
    source: 'custom',
    customHtml: draft.customHtml,
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(CUSTOM_ARTICLES_STORAGE_KEY, JSON.stringify([article, ...existing]));
  return article;
}

export function getArticleById(id: string | undefined, articleSource: FoundationArticle[] = getAllArticles()) {
  if (!id) return undefined;
  const resolvedId = ARTICLE_ALIASES[id] ?? id;
  return articleSource.find((article) => article.id === resolvedId);
}

export function getRelatedArticles(article: FoundationArticle, articleSource: FoundationArticle[] = getAllArticles()) {
  return article.relatedArticles
    .map((relatedId) => getArticleById(relatedId, articleSource))
    .filter(Boolean) as FoundationArticle[];
}
