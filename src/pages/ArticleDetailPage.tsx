import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Clock, User, ArrowRight, Menu, X, ChevronRight, ChevronLeft,
  TrendingUp, Shield, PiggyBank, CreditCard, Target, BookOpen,
  Share2, Bookmark, Facebook, Twitter, Linkedin, Home
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import logoImage from '../assets/house-icon.png';

const NAV_ITEMS = [
  { label: 'The Building Blocks', href: '/building-blocks', isRoute: true },
  { label: 'Financial Pillars', href: '/financial-pillars', isRoute: true },
  { label: 'Foundation Score', href: '/foundation-score', isRoute: true },
  { label: 'Premium', href: '/premium', isRoute: true },
  { label: 'Articles', href: '/articles', isRoute: true },
  { label: 'Newsletter', href: '/newsletter', isRoute: true },
];

interface ArticleContent {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  author: string;
  authorBio: string;
  date: string;
  pillar?: string;
  content: string[];
  relatedArticles: string[];
}

const ARTICLES: Record<string, ArticleContent> = {
  'emergency-fund-guide': {
    id: 'emergency-fund-guide',
    title: 'The Complete Guide to Building Your Emergency Fund',
    excerpt: 'Learn why an emergency fund is the cornerstone of financial stability and discover practical strategies to build yours from scratch.',
    category: 'Protection',
    readTime: '8 min read',
    author: 'Michael Torres',
    authorBio: 'Financial educator with 15+ years experience helping families build financial security.',
    date: 'Feb 28, 2024',
    pillar: 'protection',
    content: [
      `An emergency fund is one of the most important financial tools you can have. It is the financial cushion that stands between you and life's unexpected events—job loss, medical emergencies, car repairs, or home maintenance issues. Without it, many people are forced to rely on credit cards or loans, turning a temporary setback into long-term debt.`,
      
      `### Why Emergency Funds Matter\n\nThe statistics are sobering: nearly 60% of Americans cannot cover a $1,000 emergency expense. This means that a single unexpected event can derail years of financial progress. An emergency fund provides peace of mind and financial flexibility when you need it most.`,
      
      `### How Much Should You Save?\n\nThe traditional advice is to save 3-6 months of living expenses. However, the right amount depends on your situation:\n\n- **Single income household**: Aim for 6-9 months\n- **Dual income household**: 3-6 months may be sufficient\n- **Self-employed or irregular income**: Consider 9-12 months\n- **High-risk industry**: Build toward 12 months`,
      
      `### Where to Keep Your Emergency Fund\n\nYour emergency fund needs to meet two key criteria: accessible and separate. Consider these options:\n\n1. **High-yield savings account**: Best combination of accessibility and earning potential\n2. **Money market account**: Similar to savings, often with check-writing privileges\n3. **Separate bank**: Prevents impulse transfers to checking\n\nAvoid keeping your emergency fund in investments, as market downturns often coincide with job losses.`,
      
      `### Strategies to Build Your Fund\n\nBuilding an emergency fund from scratch can feel overwhelming. Here are proven strategies:\n\n**Start small and be consistent**\nBegin with a goal of $1,000, then build from there. Automate transfers to make it effortless.\n\n**Use windfalls wisely**\nTax refunds, bonuses, and gifts can supercharge your fund.\n\n**Redirect existing payments**\nOnce you pay off a debt, redirect that payment to your emergency fund.\n\n**Challenge your expenses**\nReview subscriptions and discretionary spending—temporary cuts can accelerate building.`,
      
      `### When to Use Your Emergency Fund\n\nNot every unexpected expense qualifies as an emergency. Use your fund for:\n\n- Job loss or reduced hours\n- Medical emergencies\n- Essential car or home repairs\n- Emergency travel for family matters\n\nAvoid using it for:\n\n- Planned expenses (even if unexpected timing)\n- Investment opportunities\n- Discretionary purchases\n- Vacation "emergencies"`,
      
      `### Replenishing After Use\n\nIf you need to use your emergency fund, make replenishing it a priority. Return to your automated savings strategy and consider it your next financial goal after high-interest debt.`,
      
      `### Key Takeaways\n\n1. An emergency fund is your first line of defense against financial setbacks\n2. Target 3-6 months of expenses based on your situation\n3. Keep it accessible but separate from daily spending accounts\n4. Start small, automate, and build consistently\n5. Only use for true emergencies and replenish quickly\n\nYour emergency fund is the foundation of your financial security. Start building yours today, even if it's just $50 a month. The peace of mind is worth every dollar.`,
    ],
    relatedArticles: ['life-insurance-decoded', 'budget-that-actually-works'],
  },
  'debt-freedom-roadmap': {
    id: 'debt-freedom-roadmap',
    title: 'From Debt to Freedom: Your Step-by-Step Roadmap',
    excerpt: 'Debt can feel overwhelming, but with the right strategy, you can eliminate it systematically.',
    category: 'Debt',
    readTime: '12 min read',
    author: 'Sarah Chen',
    authorBio: 'Certified financial planner specializing in debt management and wealth building.',
    date: 'Feb 25, 2024',
    pillar: 'debt',
    content: [
      `Debt is one of the most significant obstacles to building wealth. It restricts your cash flow, limits your choices, and creates ongoing stress. But here's the truth: debt is not a character flaw, and getting out of debt is achievable with the right strategy.`,
      
      `### Understanding Your Debt Landscape\n\nBefore creating a debt payoff plan, you need clarity. Gather all your debts and note:\n\n- Total balance owed\n- Interest rate\n- Minimum payment\n- Payment due date\n\nThis snapshot becomes your roadmap. You can't defeat what you don't understand.`,
      
      `### Two Proven Strategies\n\n**The Debt Snowball Method**\n\nThis approach focuses on psychological wins. List debts from smallest to largest balance, regardless of interest rate. Pay minimums on all debts, then throw every extra dollar at the smallest balance.\n\nPros: Quick wins build momentum and motivation\nCons: May cost more in interest over time\n\n**The Debt Avalanche Method**\n\nThis mathematical approach prioritizes interest rates. List debts from highest to lowest interest rate. Pay minimums on all debts, then attack the highest-rate debt first.\n\nPros: Minimizes total interest paid\nCons: May take longer to see progress`,
      
      `### Which Method Is Right for You?\n\nThe best strategy is the one you'll stick with. If you need motivation and quick wins, choose the snowball. If you're motivated by numbers and optimization, choose the avalanche. Either way, you're making progress.`,
      
      `### Accelerating Your Debt Payoff\n\nOnce you've chosen your method, look for ways to accelerate:\n\n1. **Increase income**: Side hustles, overtime, selling unused items\n2. **Reduce expenses**: Temporary cuts to discretionary spending\n3. **Negotiate rates**: Call creditors to request lower rates\n4. **Balance transfers**: Move high-rate debt to 0% offers (with caution)\n5. **Redirect payments**: When one debt is paid, add that payment to the next`,
      
      `### Avoiding Common Pitfalls\n\n- **Don't accumulate new debt**: Pause credit card use during payoff\n- **Don't sacrifice emergency fund**: Keep at least $1,000 for true emergencies\n- **Don't ignore retirement matching**: Employer match is free money\n- **Don't give up after setbacks**: One bad month doesn't erase progress`,
      
      `### Staying Motivated\n\nDebt payoff is a marathon, not a sprint. Stay motivated by:\n\n- Tracking progress visually (charts, thermometers)\n- Celebrating milestones (debt-free days)\n- Remembering your "why" (freedom, security, opportunity)\n- Finding community (online forums, local groups)`,
      
      `### Life After Debt\n\nWhen you become debt-free, don't immediately return to old habits:\n\n1. Build your emergency fund to 3-6 months\n2. Increase retirement contributions\n3. Save for planned purchases\n4. Invest in your future\n\nThe money you were sending to debt can now build wealth.`,
      
      `### Key Takeaways\n\n1. Get clarity on all your debts before starting\n2. Choose snowball or avalanche based on your personality\n3. Find ways to accelerate—every extra dollar matters\n4. Avoid new debt and maintain a small emergency fund\n5. Plan for life after debt to stay debt-free\n\nYour debt-free future starts with one decision: to begin. Choose your method, commit to the process, and watch your freedom grow.`,
    ],
    relatedArticles: ['budget-that-actually-works', 'investing-beginners-guide'],
  },
  'income-streams-diversify': {
    id: 'income-streams-diversify',
    title: 'Diversifying Your Income: Beyond the 9-to-5',
    excerpt: 'Relying on a single income source is risky. Explore practical ways to build multiple income streams.',
    category: 'Income',
    readTime: '10 min read',
    author: 'David Kim',
    authorBio: 'Entrepreneur and passive income advocate who built wealth through diversified income streams.',
    date: 'Feb 22, 2024',
    pillar: 'income',
    content: [
      `In today's economy, relying on a single income source is increasingly risky. Job security is a thing of the past, and the average person will change careers multiple times. Building multiple income streams isn't just about making more money—it's about creating security and freedom.`,
      
      `### Why Diversify Your Income?\n\nMultiple income streams provide:\n\n- **Security**: If one stream dries up, others sustain you\n- **Flexibility**: More income options mean more life choices\n- **Growth potential**: Different streams grow at different rates\n- **Tax advantages**: Business income offers deductions unavailable to employees`,
      
      `### Types of Income Streams\n\n**Earned Income**\nActive work that requires your time: salary, hourly wages, freelancing, consulting. This is where most people start but also the most limited by time.\n\n**Business Income**\nProfits from running a business. Initially requires significant time, but can become semi-passive with systems and team.\n\n**Investment Income**\nReturns from stocks, bonds, real estate, and other investments. Requires capital upfront but truly passive once established.\n\n**Passive Income**\nIncome that requires little ongoing effort: royalties, rental income, dividends, digital products. The holy grail of income diversification.`,
      
      `### Practical Income Stream Ideas\n\n**Side Hustles** (Low barrier to entry)\n- Freelancing in your skill area\n- Virtual assistance\n- Tutoring or teaching\n- Rideshare or delivery\n\n**Digital Products** (Scalable)\n- Online courses\n- E-books\n- Templates and tools\n- Stock photography\n\n**Rental Income** (Capital required)\n- Long-term rentals\n- Short-term vacation rentals\n- Storage space rental\n- Equipment rental\n\n**Investment Income** (Long-term focus)\n- Dividend stocks\n- REITs (Real Estate Investment Trusts)\n- Peer-to-peer lending\n- High-yield savings`,
      
      `### Getting Started\n\nStart where you are:\n\n1. **Audit your skills**: What do you know that others would pay for?\n2. **Identify opportunities**: Match skills to market needs\n3. **Start small**: Test ideas before major investment\n4. **Reinvest profits**: Use new income to build more streams\n\nThe goal isn't to work more—it's to work differently. Eventually, your diversified income can provide freedom from the traditional 9-to-5.`,
      
      `### Common Mistakes to Avoid\n\n- **Spreading too thin**: Master one stream before adding another\n- **Ignoring your career**: Don't neglect your primary income while building others\n- **Expecting overnight results**: Most streams take 1-3 years to become meaningful\n- **Chasing trends**: Build around your skills and interests`,
      
      `### Key Takeaways\n\n1. Multiple income streams provide security and freedom\n2. Start with earned income, build toward passive\n3. Match opportunities to your skills and resources\n4. Be patient—meaningful income takes time to build\n5. Reinvest profits to accelerate growth\n\nYour future self will thank you for starting today. Choose one stream to explore and take the first step.`,
    ],
    relatedArticles: ['investing-beginners-guide', 'setting-financial-goals'],
  },
};

const PILLAR_ICONS: Record<string, React.ElementType> = {
  income: TrendingUp,
  cashFlow: PiggyBank,
  debt: CreditCard,
  protection: Shield,
  investments: TrendingUp,
  organization: BookOpen,
  direction: Target,
};

export default function ArticleDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const article = ARTICLES[id || ''];
  
  if (!article) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-navy-900 mb-4">Article Not Found</h1>
        <button onClick={() => navigate('/articles')} className="text-copper-600 hover:text-copper-700">
          ← Back to Articles
        </button>
      </div>
    );
  }

  const Icon = article.pillar ? PILLAR_ICONS[article.pillar] : BookOpen;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Protection': 'bg-amber-100 text-amber-700',
      'Debt': 'bg-red-100 text-red-700',
      'Income': 'bg-emerald-100 text-emerald-700',
      'Cash Flow': 'bg-blue-100 text-blue-700',
      'Investments': 'bg-purple-100 text-purple-700',
      'Organization': 'bg-teal-100 text-teal-700',
      'Direction': 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getGradient = (pillar?: string) => {
    const gradients: Record<string, string> = {
      'protection': 'from-amber-100 to-orange-100',
      'debt': 'from-red-50 to-pink-50',
      'income': 'from-emerald-50 to-teal-50',
      'cashFlow': 'from-blue-50 to-indigo-50',
      'investments': 'from-purple-50 to-violet-50',
      'organization': 'from-teal-50 to-cyan-50',
      'direction': 'from-indigo-50 to-blue-50',
    };
    return gradients[pillar || ''] || 'from-gray-50 to-slate-50';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logoImage} alt="A Wealthy Foundation" className="h-10 w-auto" />
              <div>
                <h1 className="text-lg font-serif font-bold text-navy-900">A Wealthy Foundation</h1>
                <p className="text-xs text-copper-600 tracking-wider uppercase hidden sm:block">DESIGN THE LIFE YOU WANT. BUILD THE FINANCIAL HOUSE TO SUPPORT IT.</p>
              </div>
            </div>
            <nav className="hidden lg:flex items-center space-x-4">
              {NAV_ITEMS.map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => navigate(item.href)} 
                  className="text-sm font-medium text-navy-700 hover:text-copper-600"
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={() => navigate(isAuthenticated ? '/my-foundation' : '/login')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-navy-900 text-white text-sm font-semibold rounded hover:bg-navy-800 transition-colors"
              >
                <User className="w-4 h-4" />
                {isAuthenticated ? 'Dashboard' : 'Login'}
              </button>
            </nav>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1 text-navy-700">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="lg:hidden py-2 border-t border-gray-100">
              <nav className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                {NAV_ITEMS.map((item) => (
                  <button 
                    key={item.label} 
                    onClick={() => { setMobileMenuOpen(false); navigate(item.href); }} 
                    className="text-sm font-medium text-navy-700 hover:text-copper-600"
                  >
                    {item.label}
                  </button>
                ))}
                <button 
                  onClick={() => { setMobileMenuOpen(false); navigate(isAuthenticated ? '/my-foundation' : '/login'); }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-navy-900 text-white text-sm font-semibold rounded mt-1"
                >
                  <User className="w-4 h-4" />
                  {isAuthenticated ? 'Dashboard' : 'Login'}
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Article Header */}
        <section className={`bg-gradient-to-br ${getGradient(article.pillar)} py-12`}>
          <div className="max-w-3xl mx-auto px-4">
            <button 
              onClick={() => navigate('/articles')}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-copper-600 mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Articles
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(article.category)}`}>
                {article.category}
              </span>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Clock className="w-3 h-3" />
                {article.readTime}
              </div>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-900">{article.author}</p>
                  <p className="text-xs text-gray-500">{article.date}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <article className="py-12">
          <div className="max-w-3xl mx-auto px-4">
            <div className="prose prose-lg max-w-none">
              {article.content.map((paragraph, index) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h2 key={index} className="text-xl font-bold text-navy-900 mt-8 mb-4">
                      {paragraph.replace('### ', '')}
                    </h2>
                  );
                }
                return (
                  <p key={index} className="text-gray-600 mb-4 leading-relaxed whitespace-pre-line">
                    {paragraph}
                  </p>
                );
              })}
            </div>
            
            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Share this article:</span>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                      <Facebook className="w-4 h-4 text-blue-600" />
                    </button>
                    <button className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center hover:bg-sky-200 transition-colors">
                      <Twitter className="w-4 h-4 text-sky-600" />
                    </button>
                    <button className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                      <Linkedin className="w-4 h-4 text-blue-700" />
                    </button>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-copper-600 hover:text-copper-700">
                  <Bookmark className="w-4 h-4" />
                  <span className="text-sm font-medium">Save for later</span>
                </button>
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-bold text-navy-900">{article.author}</h4>
                  <p className="text-gray-600 text-sm mt-1">{article.authorBio}</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {article.relatedArticles.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-xl font-bold text-navy-900 mb-6">Related Articles</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {article.relatedArticles.map((relatedId) => {
                  const related = ARTICLES[relatedId];
                  if (!related) return null;
                  return (
                    <button
                      key={related.id}
                      onClick={() => navigate(`/articles/${related.id}`)}
                      className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-copper-300 transition-all group"
                    >
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(related.category)}`}>
                        {related.category}
                      </span>
                      <h3 className="text-lg font-bold text-navy-900 mt-3 group-hover:text-copper-600 transition-colors">
                        {related.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">{related.excerpt}</p>
                      <span className="text-copper-600 text-sm font-medium mt-3 inline-flex items-center gap-1">
                        Read More <ChevronRight className="w-4 h-4" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-12 bg-navy-900">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Discover Your Foundation Score?
            </h2>
            <p className="text-navy-300 mb-6">
              Take our free assessment to see how you score across all seven pillars of financial wellness.
            </p>
            <button
              onClick={() => navigate(isAuthenticated ? '/assessment/snapshot' : '/login?redirect=/assessment/snapshot')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-copper-600 text-white font-semibold rounded-xl hover:bg-copper-700 transition-colors"
            >
              Start Free Assessment
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <h3 className="font-serif font-bold text-base">A Wealthy Foundation</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-navy-300">
              <button onClick={() => navigate('/articles')} className="hover:text-copper-400">Articles</button>
              <button onClick={() => navigate('/#tools')} className="hover:text-copper-400">Tools</button>
              <button onClick={() => navigate('/#pillars')} className="hover:text-copper-400">Building Blocks</button>
              <button onClick={() => navigate('/#books')} className="hover:text-copper-400">Books</button>
              <button onClick={() => navigate('/#about')} className="hover:text-copper-400">About</button>
              <button onClick={() => navigate('/#contact')} className="hover:text-copper-400">Contact</button>
            </div>
            <p className="text-navy-400 w-full text-center pt-2 border-t border-navy-700 text-sm">© {new Date().getFullYear()} A Wealthy Foundation</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
