import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, CheckCircle, ArrowRight, Menu, X, Home, User,
  TrendingUp, Shield, PiggyBank, CreditCard, TreeDeciduous, DollarSign, Wallet
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

const BENEFITS = [
  { icon: TrendingUp, title: 'Actionable Strategies', description: 'Practical tips you can implement immediately to strengthen your financial foundation.' },
  { icon: Shield, title: 'Expert Insights', description: 'Learn from proven financial strategies that help you build lasting wealth.' },
  { icon: PiggyBank, title: 'Step-by-Step Guides', description: 'Clear, simple instructions to tackle each building block of your finances.' },
  { icon: TreeDeciduous, title: 'Building Block Focus', description: 'Each week, we dive deep into one pillar of your financial house.' },
];

export default function NewsletterPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
   

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <div className="inline-flex p-3 bg-copper-600/20 rounded-full mb-6">
              <Mail className="w-8 h-8 text-copper-400" />
            </div>
            <h1 className="text-3xl lg:text-5xl font-serif font-bold mb-4">The Foundation Report</h1>
            <p className="text-xl text-navy-200 mb-6">
              A weekly newsletter to help you strengthen your financial foundation, one building block at a time.
            </p>
            <p className="text-navy-300 mb-8">
              Join thousands of readers who are building stronger financial futures.
            </p>
            
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder="Your first name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-lg text-navy-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-copper-500"
                  />
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-lg text-navy-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-copper-500"
                  />
                </div>
                <button 
                  type="submit"
                  className="mt-4 w-full sm:w-auto px-8 py-3 bg-copper-600 text-white text-lg font-bold rounded-lg hover:bg-copper-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Subscribe Free <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-navy-400 text-sm mt-3">No spam. Unsubscribe anytime.</p>
              </form>
            ) : (
              <div className="max-w-md mx-auto bg-copper-600/20 rounded-xl p-6">
                <CheckCircle className="w-12 h-12 text-copper-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2">Welcome aboard!</h3>
                <p className="text-navy-200">Check your inbox for a welcome email from us.</p>
              </div>
            )}
          </div>
        </section>

        {/* What to Expect */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-navy-900 mb-3">What You'll Get</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Every week, we break down one building block of your financial foundation into actionable insights.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {BENEFITS.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-copper-100 rounded-lg">
                        <Icon className="w-6 h-6 text-copper-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-navy-900 mb-1">{benefit.title}</h3>
                        <p className="text-sm text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sample Topics */}
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-navy-900 mb-3">Recent Topics</h2>
              <p className="text-navy-600">Explore what we've covered in recent editions</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { category: 'Protection', topic: 'Building Your Emergency Fund' },
                { category: 'Debt', topic: 'The Snowball vs Avalanche Method' },
                { category: 'Investing', topic: 'Getting Started with Index Funds' },
                { category: 'Spending', topic: 'The 50/30/20 Rule Explained' },
                { category: 'Saving', topic: 'Automating Your Savings' },
                { category: 'Income', topic: 'Side Hustle Ideas That Work' },
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <span className="text-xs font-medium text-copper-600 bg-copper-100 px-2 py-1 rounded">{item.category}</span>
                  <p className="text-sm font-semibold text-navy-900 mt-2">{item.topic}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 lg:py-16 bg-navy-900 text-white">
          <div className="max-w-2xl mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-4">Ready to Strengthen Your Foundation?</h2>
            <p className="text-navy-300 mb-8">
              Join thousands of readers who are building lasting financial security.
            </p>
            <button 
              onClick={() => document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-3 px-8 py-4 bg-copper-600 text-white text-lg font-bold rounded-xl hover:bg-copper-700 transition-all shadow-lg shadow-copper-600/30"
            >
              Subscribe Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

     
    </div>
  );
}
