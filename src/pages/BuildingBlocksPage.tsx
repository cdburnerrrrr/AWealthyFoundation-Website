import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, TrendingUp, Wallet, PiggyBank, DollarSign, CreditCard, Lightbulb,
  
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

const BUILDING_BLOCKS = [
  { 
    id: 'Vision', 
    name: 'Vision', 
    icon: Lightbulb, 
    color: 'text-teal-600', 
    bg: 'bg-teal-100',
    pillar: 'Direction',
    description: 'What is this all for',
    details: 'Your vision is about more than wealth. It\'s your reason for getting wealthy. Freedom, a dream house, travel, charitable giving, your kids college funds... Vision is the guard rail that aligns your income, spending, saving, and investing decisions with what actually matters to you.'
  },
  { 
    id: 'protection', 
    name: 'Protection', 
    icon: Shield, 
    color: 'text-blue-600', 
    bg: 'bg-blue-100',
    pillar: 'Security',
    description: 'Prepare for the unexpected',
    details: 'Unexpected events such as illness, job loss, or an emergency can quickly destabilize your finances. Strong protection systems (insurance, emergency funds, contingency plans) keep your financial house standing even during storms.'
  },
  { 
    id: 'investing', 
    name: 'Investing', 
    icon: TrendingUp, 
    color: 'text-green-600', 
    bg: 'bg-green-100',
    pillar: 'Growth',
    description: 'Grow your wealth over time',
    details: 'Investing is how your money works harder than you do. Strategic investment in diversified assets builds long-term wealth that outpaces inflation and creates financial freedom. You can\'t save your way to wealth. You have to get your money making money and compounding.'
  },
  { 
    id: 'spending', 
    name: 'Spending', 
    icon: Wallet, 
    color: 'text-amber-600', 
    bg: 'bg-amber-100',
    pillar: 'Control',
    description: 'Live within your means',
    details: 'Spending habits determine whether money is your servant or your master. Mindful spending aligned with your values prevents lifestyle creep and creates space for what truly matters.'
  },
  { 
    id: 'saving', 
    name: 'Saving', 
    icon: PiggyBank, 
    color: 'text-pink-500', 
    bg: 'bg-pink-100',
    pillar: 'Consistency',
    description: 'Build financial reserves',
    details: 'Saving isn\'t about deprivation — it\'s about creating options and freedom. Regular saving builds a buffer against uncertainty and funds your goals without debt.'
  },
  { 
    id: 'income', 
    name: 'Income', 
    icon: DollarSign, 
    color: 'text-purple-600', 
    bg: 'bg-purple-100',
    pillar: 'Clarity',
    description: 'Maximize your earning potential',
    details: 'Your income is the foundation of your financial engine. Increasing your earning potential through skill development, career advancement, or multiple income streams accelerates all other building blocks.'
  },
  { 
    id: 'debt', 
    name: 'Debt', 
    icon: CreditCard, 
    color: 'text-red-500', 
    bg: 'bg-red-100',
    pillar: 'Efficiency',
    description: 'Manage and eliminate debt',
    details: 'Debt can be a tool or a trap. The difference lies in strategy. Managing debt efficiently (distinguishing good debt from bad) accelerates wealth building rather than hindering it. '
  },
];

export default function BuildingBlocksPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
     
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-5 lg:py-6">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <h1 className="text-2xl lg:text-4xl font-serif font-bold mb-3">The 7 Building Blocks</h1>
            <p className="text-base lg:text-lg text-navy-200 mb-3 max-w-2xl mx-auto">
              These seven areas form the foundation of your financial house. 
              Strong blocks create a solid foundation for the life you want.
            </p>
          </div>
        </section>

        {/* Building Blocks Grid */}
        <section className="py-12 lg:py-16">
          <div className="max-w-5xl mx-auto px-4 lg:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BUILDING_BLOCKS.map((block) => {
                const Icon = block.icon;
                return (
                  <div key={block.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${block.bg}`}>
                        <Icon className={`w-8 h-8 ${block.color}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-navy-900">{block.name}</h3>
                        <p className="text-sm text-copper-600 font-medium">Strengthens: {block.pillar}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{block.description}</p>
                    <p className="text-sm text-gray-500">{block.details}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How They Connect */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-navy-900 mb-4">How the Building Blocks Connect</h2>
            <p className="text-navy-600 mb-8">
              Each building block strengthens a specific pillar of your financial foundation. 
              When all 7 blocks are strong, your entire financial house is solid.
            </p>
            <button onClick={() => navigate('/financial-pillars')} className="inline-flex items-center gap-2 px-6 py-3 bg-copper-600 text-white font-semibold rounded-lg hover:bg-copper-700 transition-colors">
              View the 7 Financial Pillars
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