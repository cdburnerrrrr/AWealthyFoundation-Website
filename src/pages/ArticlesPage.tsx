import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CreditCard,
  DollarSign,
  Eye,
  Lightbulb,
  PiggyBank,
  Shield,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  ARTICLE_CATEGORIES,
  BUILDING_BLOCK_META,
  getAllArticles,
  isArticleAdminEmail,
  type BuildingBlockKey,
  type FoundationArticle,
} from '../data/foundationArticles';
import { useAppStore } from '../store/appStore';

const BLOCK_ICONS: Record<BuildingBlockKey, ElementType> = {
  vision: Lightbulb,
  protection: Shield,
  investing: TrendingUp,
  spending: Wallet,
  saving: PiggyBank,
  income: DollarSign,
  debt: CreditCard,
};

function ArticleVisual({ article }: { article: FoundationArticle }) {
  const meta = BUILDING_BLOCK_META[article.pillar];
  const Icon = BLOCK_ICONS[article.pillar] || BookOpen;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${meta.border} bg-gradient-to-br ${meta.gradient} p-4`}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.24]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a1e_1px,transparent_1px),linear-gradient(to_bottom,#0f3a5a16_1px,transparent_1px)] bg-[size:18px_18px]" />
      </div>
      <div className="relative z-10 flex min-h-[132px] flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${meta.bg} ${meta.text} shadow-sm ring-1 ${meta.ring}`}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-navy-700 shadow-sm">
            {article.imageLabel}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {article.chart.items.map((item) => (
            <div key={item.label} className="rounded-xl bg-white/72 p-2 ring-1 ring-white/70">
              <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-slate-200/75">
                <div className={`h-full rounded-full ${meta.chart}`} style={{ width: `${item.value}%` }} />
              </div>
              <p className="truncate text-[10px] font-semibold text-navy-800">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, featured = false }: { article: FoundationArticle; featured?: boolean }) {
  const navigate = useNavigate();
  const meta = BUILDING_BLOCK_META[article.pillar];
  const Icon = BLOCK_ICONS[article.pillar] || BookOpen;

  return (
    <article
      onClick={() => navigate(`/articles/${article.id}`)}
      className={`group cursor-pointer overflow-hidden rounded-[28px] border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-copper-500/10 ${
        featured ? 'border-copper-300 lg:grid lg:grid-cols-[0.95fr_1.05fr]' : 'border-slate-200 hover:border-copper-300'
      }`}
    >
      <div className={featured ? 'p-4 sm:p-5' : 'p-4'}>
        <ArticleVisual article={article} />
      </div>

      <div className="flex flex-col p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}>
            <Icon className="h-3.5 w-3.5" />
            {article.category}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {article.readTime}
          </span>
        </div>

        <h3 className={`${featured ? 'text-2xl sm:text-3xl' : 'text-xl'} font-bold tracking-tight text-navy-900 group-hover:text-copper-700`}>
          {article.title}
        </h3>
        <p className={`${featured ? 'mt-4 text-base leading-7' : 'mt-3 text-sm leading-6'} text-slate-600`}>
          {article.excerpt}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-navy-700">Strengthens {meta.strengthens}</p>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-copper-700 transition group-hover:translate-x-1">
            Read article
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}

export default function ArticlesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const articles = useMemo(() => getAllArticles(), []);
  const userEmail = String((user as any)?.email ?? '').toLowerCase();
  const canCreateArticles = isArticleAdminEmail(userEmail);

  const featuredArticle = articles[0];
  const filteredArticles = useMemo(() => {
    const source = selectedCategory === 'All'
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

    return selectedCategory === 'All' && featuredArticle
      ? source.filter((article) => article.id !== featuredArticle.id)
      : source;
  }, [articles, featuredArticle, selectedCategory]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#d8ecf8] text-navy-900">
      <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#eef8ff_0%,#d8ecf8_48%,#c6e2f2_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a2f_1px,transparent_1px),linear-gradient(to_bottom,#0f3a5a2f_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-copper-400/14 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-140px] right-[-80px] h-96 w-96 rounded-full bg-sky-400/12 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-copper-300/45 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                The Foundation Report
              </div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
                Practical articles for strengthening each part of your financial house.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-navy-700 sm:text-lg">
                Explore the 7 Building Blocks through plain-English guides, visual examples, and action steps that connect back to your Foundation Score.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate(isAuthenticated ? '/assessment/snapshot' : '/login?redirect=/assessment/snapshot')}
                  className="inline-flex items-center gap-2 rounded-xl bg-copper-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-copper-600/20 transition hover:bg-copper-700"
                >
                  Start Free Snapshot
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/foundation-tools')}
                  className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white/70 px-5 py-3 text-sm font-bold text-navy-800 transition hover:bg-white"
                >
                  Explore Foundation Tools
                </button>
                {canCreateArticles && (
                  <button
                    type="button"
                    onClick={() => navigate('/articles/new')}
                    className="inline-flex items-center gap-2 rounded-xl border border-copper-300 bg-white/80 px-5 py-3 text-sm font-bold text-copper-700 transition hover:bg-copper-50"
                  >
                    <Plus className="h-4 w-4" />
                    New Article
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/60 bg-white/60 p-3 shadow-2xl shadow-navy-900/10 backdrop-blur-sm">
              {featuredArticle && <ArticleCard article={featuredArticle} featured />}
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-[68px] z-30 border-y border-navy-200/70 bg-white/82 px-4 py-4 backdrop-blur sm:px-6 lg:top-[74px] lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ARTICLE_CATEGORIES.map((category) => {
              const block = Object.values(BUILDING_BLOCK_META).find((item) => item.name === category);
              const selected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selected
                      ? 'border-copper-500 bg-copper-600 text-white shadow-lg shadow-copper-600/15'
                      : block
                        ? `${block.border} ${block.bg} ${block.text} hover:bg-white`
                        : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-700">Article Library</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-900">Read by Building Block</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white/75 p-12 text-center shadow-sm">
              <BarChart3 className="mx-auto mb-4 h-10 w-10 text-copper-600" />
              <p className="text-slate-600">No articles found in this category yet. Use New Article to create one.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
