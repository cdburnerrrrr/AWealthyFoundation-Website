import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, TrendingUp, Wallet, PiggyBank, DollarSign, CreditCard, TreeDeciduous,
  Menu, X, ArrowRight, CheckCircle, User, Clock, Home
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import heroImage from '../assets/finance-couple.jpg';
import houseIcon from '../assets/house-outline.png';
import pillarsHouseImage from '../assets/pillars-house.png';

const NAV_ITEMS = [
  { label: 'The Building Blocks', href: '/building-blocks', isRoute: true },
  { label: 'Financial Pillars', href: '/financial-pillars', isRoute: true },
  { label: 'Foundation Score', href: '/foundation-score', isRoute: true },
  { label: 'Premium', href: '/premium', isRoute: true },
  { label: 'Articles', href: '/articles', isRoute: true },
  { label: 'Newsletter', href: '/newsletter', isRoute: true },
];

interface PillarInfo {
  name: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  primaryPillar: string;
  alsoSupports: string[];
  whyItMatters: string;
}

const SEVEN_PILLARS: PillarInfo[] = [
  {
    name: 'LEGACY',
    subtitle: 'Leave a lasting impact',
    icon: TreeDeciduous,
    color: 'text-teal-600',
    primaryPillar: 'Purpose',
    alsoSupports: ['Security', 'Clarity'],
    whyItMatters: 'Your legacy is about more than wealth — it\'s about the values, wisdom, and opportunities you pass on. Estate planning, charitable giving, and teaching financial literacy ensure your impact extends beyond your lifetime.'
  },
  {
    name: 'PROTECTION',
    subtitle: 'Prepare for the unexpected',
    icon: Shield,
    color: 'text-blue-600',
    primaryPillar: 'Security',
    alsoSupports: ['Control', 'Consistency'],
    whyItMatters: 'Unexpected events — illness, job loss, emergencies — can quickly destabilize your finances. Strong protection systems (insurance, emergency funds, contingency plans) keep your financial house standing even during storms.'
  },
  {
    name: 'INVESTING',
    subtitle: 'Grow your wealth over time',
    icon: TrendingUp,
    color: 'text-green-600',
    primaryPillar: 'Growth',
    alsoSupports: ['Purpose', 'Clarity'],
    whyItMatters: 'Investing is how your money works harder than you do. Strategic investment in diversified assets builds long-term wealth that outpaces inflation and creates financial freedom.'
  },
  {
    name: 'SPENDING',
    subtitle: 'Live within your means',
    icon: Wallet,
    color: 'text-amber-600',
    primaryPillar: 'Control',
    alsoSupports: ['Consistency', 'Efficiency'],
    whyItMatters: 'Spending habits determine whether money is your servant or your master. Mindful spending aligned with your values prevents lifestyle creep and creates space for what truly matters.'
  },
  {
    name: 'SAVING',
    subtitle: 'Build financial reserves',
    icon: PiggyBank,
    color: 'text-pink-500',
    primaryPillar: 'Consistency',
    alsoSupports: ['Security', 'Control'],
    whyItMatters: 'Saving isn\'t about deprivation — it\'s about creating options and freedom. Regular saving builds a buffer against uncertainty and funds your goals without debt.'
  },
  {
    name: 'INCOME',
    subtitle: 'Maximize your earning potential',
    icon: DollarSign,
    color: 'text-purple-600',
    primaryPillar: 'Clarity',
    alsoSupports: ['Growth', 'Efficiency'],
    whyItMatters: 'Your income is the foundation of your financial engine. Increasing your earning potential through skill development, career advancement, or multiple income streams accelerates all other building blocks.'
  },
  {
    name: 'DEBT',
    subtitle: 'Manage and eliminate debt',
    icon: CreditCard,
    color: 'text-red-500',
    primaryPillar: 'Efficiency',
    alsoSupports: ['Control', 'Consistency'],
    whyItMatters: 'Debt can be a tool or a trap — the difference lies in strategy. Managing debt efficiently (distinguishing good debt from bad) accelerates wealth building rather than hindering it.'
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<PillarInfo | null>(null);
  const [animatedPillars, setAnimatedPillars] = useState<number[]>([]);
  const pillarsRef = useRef<HTMLDivElement>(null);

  // Intersection observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setTimeout(() => {
              setAnimatedPillars((prev) => [...new Set([...prev, index])]);
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.pillar-item');
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/assessment/snapshot');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
     

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section - Integrated Design */}
        <section className="bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
            <div className="grid lg:grid-cols-2 gap-4 items-center">
              <div className="text-center lg:text-left order-2 lg:order-1">
                <p className="text-sm font-semibold text-copper-600 tracking-widest uppercase mb-1">A Simple Framework for Building Wealth</p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-navy-900 leading-tight mb-1">
                  Design the Life You Want.
                </h2>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-copper-600 leading-tight mb-3">
                  Build the Financial House to Support It.
                </h2>
                <p className="text-base text-navy-600 mb-4 max-w-md mx-auto lg:mx-0">
                  Discover how strong your financial foundation really is.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-3">
                  <button
                    onClick={handleGetStarted}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-copper-600 text-white text-base font-bold rounded-xl hover:bg-copper-700 transition-all shadow-lg shadow-copper-600/30"
                  >
                    Take the FREE Test <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-navy-500 flex items-center justify-center lg:justify-start gap-4">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 5 Minutes</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Free</span>
                </p>
              </div>
              <div className="order-1 lg:order-2">
                <img
                  src={pillarsHouseImage}
                  alt="The Seven Building Blocks of a Wealthy House"
                  className="w-full h-auto max-w-sm mx-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Building Blocks Section - Right Below Hero */}
        <section id="building-blocks" className="py-6 lg:py-8 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <h2 className="text-2xl font-serif font-bold text-navy-900 text-center mb-2">The 7 Building Blocks</h2>
            <p className="text-blue-600 text-center mb-6 font-medium">Each of the 7 Building Blocks strengthens a Pillar of your Financial Foundation.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
              {SEVEN_PILLARS.map((pillar, index) => {
                const Icon = pillar.icon;
                const isAnimated = animatedPillars.includes(index);
                return (
                  <button
                    key={pillar.name}
                    data-index={index}
                    onClick={() => setSelectedPillar(pillar)}
                    className={`pillar-item group p-3 bg-white rounded-xl border-2 border-gray-100 hover:border-copper-300 hover:shadow-lg transition-all duration-300 text-center
                      ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                    `}
                  >
                    <div className={`${pillar.color} flex justify-center mb-2`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-navy-900 text-xs">{pillar.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pillar.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pillar Detail Modal */}
        {selectedPillar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedPillar(null)}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  {selectedPillar.icon && (
                    <div className={`${selectedPillar.color} mb-2`}>
                      {(() => {
                        const Icon = selectedPillar.icon;
                        return <Icon className="w-10 h-10" />;
                      })()}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-navy-900">{selectedPillar.name}</h3>
                  <p className="text-copper-600 font-medium">{selectedPillar.subtitle}</p>
                </div>
                <button onClick={() => setSelectedPillar(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-navy-600 leading-relaxed">{selectedPillar.whyItMatters}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-blue-800 uppercase mb-1">Primary Pillar Strengthened</p>
                <p className="text-navy-900 font-medium">{selectedPillar.primaryPillar}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Also Supports</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPillar.alsoSupports.map((support) => (
                    <span key={support} className="text-sm text-navy-700">• {support}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setSelectedPillar(null); navigate('/assessment/snapshot'); }}
                className="w-full py-2.5 bg-copper-600 text-white font-semibold rounded-lg hover:bg-copper-700 transition-colors"
              >
                Assess Your {selectedPillar.name} Block
              </button>
            </div>
          </div>
        )}

        {/* Copper Divider */}
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-copper-500/30 to-copper-500/30 via-[60%] to-transparent"></div>

        {/* House & Premium Assessments - 3 Column Layout */}
        <section id="pillars" className="py-3 lg:py-4 bg-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              {/* Discover Your Foundation Score */}
              <div className="bg-navy-900 rounded-lg p-5 text-white h-full flex flex-col">
                <div className="mb-3">
                  <h4 className="text-lg font-bold mb-1">Discover Your Foundation Score</h4>
                  <p className="text-navy-300 text-sm">See how aligned your financial house is across all 7 building blocks.</p>
                </div>
                <ul className="space-y-2 mb-4 flex-grow">
                  <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-copper-400" /> Personalized Wealth Score (300-850)</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-copper-400" /> Building Block Breakdown</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-copper-400" /> Actionable Next Steps</li>
                  <li className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-copper-400" /> Custom Recommendations</li>
                </ul>
                <button onClick={handleGetStarted} className="w-full py-3 bg-copper-500 text-white text-sm font-bold rounded-lg hover:bg-copper-600 transition-colors">
                  Start the Free Assessment
                </button>
              </div>
              {/* Foundation Assessment - $29 */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-copper-300 hover:shadow-md transition-all h-full flex flex-col">
                <div className="mb-3">
                  <h4 className="text-lg font-bold text-navy-900">Foundation Assessment</h4>
                  <span className="text-2xl font-bold text-copper-600">$29</span>
                </div>
                <p className="text-sm text-navy-600 mb-3 flex-grow">Full 6-Building Block Wealth Assessment with detailed breakdown and recommendations.</p>
                <ul className="space-y-1 mb-4 text-sm text-navy-700">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-copper-500" /> Detailed Wealth Score breakdown</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-copper-500" /> Personalized recommendations</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-copper-500" /> Progress tracking dashboard</li>
                </ul>
                <button onClick={() => isAuthenticated ? navigate('/assessment/comprehensive?tier=foundation-assessment') : navigate('/login?redirect=/assessment/comprehensive?tier=foundation-assessment')} className="w-full py-2.5 border border-copper-500 text-copper-600 text-sm font-semibold rounded hover:bg-copper-50 transition-colors">
                  Start Assessment
                </button>
              </div>
              {/* Foundation Roadmap - $79 */}
              <div className="bg-navy-900 rounded-lg p-5 text-white relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-3 right-3 px-2 py-1 bg-copper-500 text-white text-xs font-bold rounded">Most Popular</div>
                <div className="mb-3">
                  <h4 className="text-lg font-bold">Foundation Roadmap</h4>
                  <span className="text-2xl font-bold text-copper-400">$79</span>
                </div>
                <p className="text-sm text-navy-300 mb-3 flex-grow">Everything in Foundation Assessment plus a custom 12-month action blueprint.</p>
                <ul className="space-y-1 mb-4 text-sm text-navy-200">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-copper-400" /> Custom 12-month action blueprint</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-copper-400" /> Provider recommendations</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-copper-400" /> Downloadable PDF report</li>
                </ul>
                <button onClick={() => isAuthenticated ? navigate('/assessment/comprehensive?tier=foundation-roadmap') : navigate('/login?redirect=/assessment/comprehensive?tier=foundation-roadmap')} className="w-full py-2.5 bg-copper-500 text-white text-sm font-semibold rounded hover:bg-copper-600 transition-colors">
                  Start Assessment
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - 3 Column Layout */}
        <section id="score" className="py-2 lg:py-3 bg-gray-50/30 flex-1">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Latest Article */}
              <div id="articles" className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-navy-900">Latest Article</h4>
                  <button onClick={() => navigate('/articles')} className="text-copper-600 font-medium text-sm hover:text-copper-700">View All →</button>
                </div>
                <button onClick={() => navigate('/articles/emergency-fund-guide')} className="text-left w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Protection</span>
                  <h5 className="text-sm font-semibold text-navy-900 mt-2 group-hover:text-copper-600 transition-colors">The Complete Guide to Building Your Emergency Fund</h5>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">Learn why an emergency fund is the cornerstone of financial stability.</p>
                </button>
              </div>

              {/* Newsletter */}
              <div id="newsletter" className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-base font-bold text-navy-900 mb-1">Join Our Newsletter</h4>
                <p className="text-navy-500 text-sm mb-3">Weekly insights on building a strong foundation.</p>
                <div className="space-y-2">
                  <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-copper-500" />
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-copper-500" />
                  <button className="w-full py-2 bg-navy-900 text-white text-sm font-medium rounded hover:bg-navy-800 transition-colors">Subscribe</button>
                  <p className="text-xs text-navy-400 text-center">No Spam, Just Real Strategies</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

     
    </div>
  );
}
