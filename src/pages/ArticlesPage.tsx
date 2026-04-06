import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, User, ArrowRight, Menu, X, ChevronRight, Plus,
  TrendingUp, Shield, PiggyBank, CreditCard, Target, BookOpen,
  TreeDeciduous, DollarSign, Wallet, Home
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

const NAV_ITEMS = [
  { label: 'The Building Blocks', href: '/building-blocks', isRoute: true },
  { label: 'Financial Pillars', href: '/financial-pillars', isRoute: true },
  { label: 'Foundation Score', href: '/foundation-score', isRoute: true },
  { label: 'Premium', href: '/premium', isRoute: true },
  { label: 'Articles', href: '/articles', isRoute: true },
  { label: 'Newsletter', href: '/newsletter', isRoute: true },
];

const BUILDING_BLOCKS = [
  { id: 'legacy', name: 'Legacy', icon: TreeDeciduous, color: 'text-teal-600', bg: 'bg-teal-100' },
  { id: 'protection', name: 'Protection', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'investing', name: 'Investing', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  { id: 'spending', name: 'Spending', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: 'saving', name: 'Saving', icon: PiggyBank, color: 'text-pink-500', bg: 'bg-pink-100' },
  { id: 'income', name: 'Income', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
  { id: 'debt', name: 'Debt', icon: CreditCard, color: 'text-red-500', bg: 'bg-red-100' },
];

const PILLAR_ICONS: Record<string, React.ElementType> = {
  legacy: TreeDeciduous,
  protection: Shield,
  investing: TrendingUp,
  spending: Wallet,
  saving: PiggyBank,
  income: DollarSign,
  debt: CreditCard,
};

const CATEGORIES = ['All', ...BUILDING_BLOCKS.map(b => b.name)];

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  author: string;
  date: string;
  image: string;
  pillar?: string;
}

const ARTICLES: Article[] = [
  {
    id: 'emergency-fund-guide',
    title: 'The Complete Guide to Building Your Emergency Fund',
    excerpt: 'Learn why an emergency fund is the cornerstone of financial stability.',
    category: 'Protection',
    readTime: '8 min read',
    author: 'A Wealthy Foundation',
    date: 'Feb 28, 2024',
    image: 'emergency',
    pillar: 'protection',
  },
  {
    id: 'debt-freedom-roadmap',
    title: 'From Debt to Freedom: Your Step-by-Step Roadmap',
    excerpt: 'Debt can feel overwhelming, but with the right strategy, you can eliminate it.',
    category: 'Debt',
    readTime: '12 min read',
    author: 'A Wealthy Foundation',
    date: 'Feb 25, 2024',
    image: 'debt',
    pillar: 'debt',
  },
  {
    id: 'income-streams-diversify',
    title: 'Diversifying Your Income: Beyond the 9-to-5',
    excerpt: 'Relying on a single income source is risky. Explore ways to build multiple streams.',
    category: 'Income',
    readTime: '10 min read',
    author: 'A Wealthy Foundation',
    date: 'Feb 22, 2024',
    image: 'income',
    pillar: 'income',
  },
  {
    id: 'budget-that-actually-works',
    title: 'Create a Budget That Actually Works for Your Life',
    excerpt: 'Most budgets fail because they are too restrictive. Learn how to create a flexible system.',
    category: 'Spending',
    readTime: '7 min read',
    author: 'A Wealthy Foundation',
    date: 'Feb 20, 2024',
    image: 'budget',
    pillar: 'spending',
  },
  {
    id: 'investing-beginners-guide',
    title: 'Investing for Beginners: Start Growing Your Wealth Today',
    excerpt: 'The world of investing can seem complex, but getting started is simpler than you think.',
    category: 'Investing',
    readTime: '15 min read',
    author: 'A Wealthy Foundation',
    date: 'Feb 18, 2024',
    image: 'investing',
    pillar: 'investing',
  },
  {
    id: 'saving-strategies',
    title: 'Smart Saving Strategies: Building Your Financial Safety Net',
    excerpt: 'Saving isn\'t about deprivation—it\'s about creating options and freedom.',
    category: 'Saving',
    readTime: '9 min read',
    author: 'A Wealthy Foundation',
    date: 'Feb 5, 2024',
    image: 'saving',
    pillar: 'saving',
  },
  {
    id: 'legacy-planning-guide',
    title: 'Building Your Legacy: A Comprehensive Guide to Estate Planning',
    excerpt: 'Your legacy is about more than wealth—it\'s about the values you pass on.',
    category: 'Legacy',
    readTime: '12 min read',
    author: 'A Wealthy Foundation',
    date: 'Feb 8, 2024',
    image: 'legacy',
    pillar: 'legacy',
  },
];

function ArticleCard({ article }: { article: Article }) {
  const navigate = useNavigate();
  const Icon = article.pillar ? PILLAR_ICONS[article.pillar] || BookOpen : BookOpen;
  
  return (
    <article 
      onClick={() => navigate(`/articles/${article.id}`)}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-copper-300 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="aspect-[2.5/1] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Icon className="w-12 h-12 text-gray-300" />
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-copper-600 bg-copper-50 px-2 py-1 rounded">{article.category}</span>
        <h3 className="text-base font-bold text-navy-900 mt-2 line-clamp-2">{article.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{article.readTime}</span>
        </div>
      </div>
    </article>
  );
}

export default function ArticlesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const filteredArticles = selectedCategory === 'All' 
    ? ARTICLES 
    : ARTICLES.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-3">
              <Home className="w-9 h-9 text-copper-600" />
              <div>
                <h1 className="text-xl font-serif font-bold text-navy-900">A Wealthy Foundation</h1>
                <p className="text-xs text-copper-600">Design the life you want.</p>
              </div>
            </button>
            <nav className="hidden md:flex items-center space-x-4">
              {NAV_ITEMS.map((item) => (
                <button key={item.label} onClick={() => navigate(item.href)} className="text-sm font-medium text-navy-700 hover:text-copper-600">
                  {item.label}
                </button>
              ))}
            </nav>
            <button 
              onClick={() => navigate(isAuthenticated ? '/my-foundation' : '/login')}
              className="px-4 py-1.5 bg-navy-900 text-white text-sm font-semibold rounded"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-navy-900 mb-4">Insights for Building Your Foundation</h1>
          <p className="text-gray-600">Practical strategies to strengthen each pillar of your financial life.</p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-4 border-b border-gray-100 bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${
                  selectedCategory === category 
                    ? 'bg-copper-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No articles found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
