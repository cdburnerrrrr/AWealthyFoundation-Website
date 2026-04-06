import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, TrendingUp, Wallet, PiggyBank, DollarSign, CreditCard, TreeDeciduous,
  Menu, X, Home, User
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

const PILLARS = [
  { 
    id: 'purpose', 
    name: 'Purpose', 
    icon: TreeDeciduous, 
    color: 'text-teal-600', 
    bg: 'bg-teal-100',
    block: 'Legacy',
    description: 'Define your why and legacy goals',
    details: 'Your purpose drives all financial decisions. What do you want to achieve? What impact do you want to leave? Defining your purpose gives your finances meaning and direction.'
  },
  { 
    id: 'security', 
    name: 'Security', 
    icon: Shield, 
    color: 'text-blue-600', 
    bg: 'bg-blue-100',
    block: 'Protection',
    description: 'Protect what you\'ve built',
    details: 'Financial security means having the protection and peace of mind that comes from insurance, emergency funds, and contingency plans. It\'s the shield that guards your wealth.'
  },
  { 
    id: 'growth', 
    name: 'Growth', 
    icon: TrendingUp, 
    color: 'text-green-600', 
    bg: 'bg-green-100',
    block: 'Investing',
    description: 'Build wealth over time',
    details: 'Growth is about making your money work for you. Through smart investing in diversified assets, your wealth can outpace inflation and create long-term financial freedom.'
  },
  { 
    id: 'control', 
    name: 'Control', 
    icon: Wallet, 
    color: 'text-amber-600', 
    bg: 'bg-amber-100',
    block: 'Spending',
    description: 'Master your financial decisions',
    details: 'Control means your money serves you, not the other way around. When you control your spending, you direct your resources toward what truly matters to you.'
  },
  { 
    id: 'consistency', 
    name: 'Consistency', 
    icon: PiggyBank, 
    color: 'text-pink-500', 
    bg: 'bg-pink-100',
    block: 'Saving',
    description: 'Build habits that last',
    details: 'Consistency beats intensity every time. Regular saving habits, even small amounts, compound over time to create significant wealth and financial options.'
  },
  { 
    id: 'clarity', 
    name: 'Clarity', 
    icon: DollarSign, 
    color: 'text-purple-600', 
    bg: 'bg-purple-100',
    block: 'Income',
    description: 'See your financial picture',
    details: 'Clarity comes from understanding your full financial picture. When you maximize your income potential and understand your cash flow, you can make informed decisions.'
  },
  { 
    id: 'efficiency', 
    name: 'Efficiency', 
    icon: CreditCard, 
    color: 'text-red-500', 
    bg: 'bg-red-100',
    block: 'Debt',
    description: 'Maximize your resources',
    details: 'Efficiency is about eliminating waste and optimizing every dollar. Managing debt efficiently, minimizing taxes, and reducing unnecessary expenses maximizes your financial output.'
  },
];

export default function FinancialPillarsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Home className="w-10 h-10 text-copper-600" />
              <div>
                <h1 className="text-xl font-serif font-bold text-navy-900">A Wealthy Foundation</h1>
                <p className="text-xs text-copper-600">Design the life you want. Build the financial foundation to support it.</p>
              </div>
            </button>
            <nav className="hidden lg:flex items-center space-x-4">
              {NAV_ITEMS.map((item) => (
                item.isRoute ? (
                  <button key={item.label} onClick={() => navigate(item.href)} className="text-sm font-medium text-navy-700 hover:text-copper-600">
                    {item.label}
                  </button>
                ) : (
                  <a key={item.label} href={item.href} className="text-sm font-medium text-navy-700 hover:text-copper-600">
                    {item.label}
                  </a>
                )
              ))}
            </nav>
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/my-foundation')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-copper-600 text-white text-sm font-semibold rounded hover:bg-copper-700 transition-colors"
              >
                <User className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-navy-900 text-white text-sm font-semibold rounded hover:bg-navy-800 transition-colors"
              >
                <User className="w-4 h-4" />
                Login
              </button>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1 text-navy-700">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="lg:hidden py-2 border-t border-gray-100">
              <nav className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                {NAV_ITEMS.map((item) => (
                  item.isRoute ? (
                    <button key={item.label} onClick={() => { setMobileMenuOpen(false); navigate(item.href); }} className="text-sm font-medium text-navy-700 hover:text-copper-600">
                      {item.label}
                    </button>
                  ) : (
                    <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-navy-700 hover:text-copper-600">
                      {item.label}
                    </a>
                  )
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <h1 className="text-3xl lg:text-5xl font-serif font-bold mb-4">The 7 Financial Pillars</h1>
            <p className="text-xl text-navy-200 mb-8">
              These seven pillars support your entire financial house. 
              A strong foundation means all pillars are equally solid.
            </p>
          </div>
        </section>

        {/* Pillars Grid */}
        <section className="py-12 lg:py-16">
          <div className="max-w-5xl mx-auto px-4 lg:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${pillar.bg}`}>
                        <Icon className={`w-8 h-8 ${pillar.color}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-navy-900">{pillar.name}</h3>
                        <p className="text-sm text-copper-600 font-medium">Supported by: {pillar.block}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{pillar.description}</p>
                    <p className="text-sm text-gray-500">{pillar.details}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How They Connect */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-navy-900 mb-4">The Connection to Building Blocks</h2>
            <p className="text-navy-600 mb-8">
              Each financial pillar is strengthened by specific building blocks. 
              When you work on your building blocks, you're simultaneously reinforcing your pillars.
            </p>
            <button onClick={() => navigate('/building-blocks')} className="inline-flex items-center gap-2 px-6 py-3 bg-copper-600 text-white font-semibold rounded-lg hover:bg-copper-700 transition-colors">
              View the 7 Building Blocks
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg">A Wealthy Foundation</h3>
              <p className="text-navy-400 text-sm">Design the life you want. Build the financial foundation to support it.</p>
            </div>
            <div className="flex gap-6 text-sm text-navy-300">
              <button onClick={() => navigate('/articles')} className="hover:text-copper-400">Articles</button>
              <a href="#pillars" className="hover:text-copper-400">Building Blocks</a>
              <a href="#premium" className="hover:text-copper-400">Premium</a>
            </div>
          </div>
          <p className="text-navy-500 text-xs text-center mt-6">© {new Date().getFullYear()} A Wealthy Foundation</p>
        </div>
      </footer>
    </div>
  );
}
