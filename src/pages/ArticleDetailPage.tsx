import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ElementType } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Eye,
  Lightbulb,
  PiggyBank,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  BUILDING_BLOCK_META,
  getAllArticles,
  getArticleById,
  getRelatedArticles,
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

function ArticleArtwork({ article }: { article: FoundationArticle }) {
  const meta = BUILDING_BLOCK_META[article.pillar];
  const Icon = BLOCK_ICONS[article.pillar] || BookOpen;

  return (
    <div className={`relative overflow-hidden rounded-[32px] border ${meta.border} bg-gradient-to-br ${meta.gradient} p-6 shadow-2xl shadow-navy-900/10`}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a22_1px,transparent_1px),linear-gradient(to_bottom,#0f3a5a18_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/70 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${meta.bg} ${meta.text} shadow-lg ring-1 ${meta.ring}`}>
            <Icon className="h-10 w-10" />
          </div>
          <div className="rounded-full bg-white/78 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-navy-700 shadow-sm">
            {article.imageLabel}
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-white/72 p-4 ring-1 ring-white/70">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Visual model</p>
              <h3 className="mt-1 text-lg font-bold text-navy-900">{article.chart.title}</h3>
            </div>
            <BarChart3 className={`h-6 w-6 ${meta.text}`} />
          </div>

          <div className="space-y-3">
            {article.chart.items.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between gap-4 text-sm">
                  <span className="font-semibold text-navy-800">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-500">{item.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200/80">
                  <div className={`h-full rounded-full ${meta.chart}`} style={{ width: `${item.value}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RelatedCard({ article }: { article: FoundationArticle }) {
  const navigate = useNavigate();
  const meta = BUILDING_BLOCK_META[article.pillar];
  const Icon = BLOCK_ICONS[article.pillar] || BookOpen;

  return (
    <button
      type="button"
      onClick={() => navigate(`/articles/${article.id}`)}
      className="group rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-copper-300 hover:shadow-xl hover:shadow-copper-500/10"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${meta.bg} ${meta.text}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}>{article.category}</span>
      </div>
      <h3 className="text-lg font-bold text-navy-900 group-hover:text-copper-700">{article.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{article.excerpt}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-copper-700">
        Read next <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

export default function ArticleDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAppStore();
  const articles = useMemo(() => getAllArticles(), []);
  const article = getArticleById(id, articles);

  if (!article) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-copper-600" />
          <h1 className="text-2xl font-bold text-navy-900">Article Not Found</h1>
          <p className="mt-2 text-slate-600">That article may have moved as the article library was cleaned up.</p>
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-copper-600 px-5 py-3 text-sm font-bold text-white hover:bg-copper-700"
          >
            Back to Articles
          </button>
        </div>
      </main>
    );
  }

  const meta = BUILDING_BLOCK_META[article.pillar];
  const Icon = BLOCK_ICONS[article.pillar] || BookOpen;
  const relatedArticles = getRelatedArticles(article, articles);

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-navy-900">
      <section className="relative overflow-hidden bg-[#d8ecf8] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#eef8ff_0%,#d8ecf8_50%,#c6e2f2_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#0f3a5a2f_1px,transparent_1px),linear-gradient(to_bottom,#0f3a5a2f_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-copper-700 transition hover:text-copper-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </button>

          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${meta.bg} ${meta.text}`}>
                  <Icon className="h-4 w-4" />
                  {article.category}
                </span>
                <span className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-navy-600 shadow-sm">
                  {article.readTime}
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
                {article.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-navy-700">{article.excerpt}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {article.takeaways.map((takeaway) => (
                  <div key={takeaway} className="rounded-2xl border border-white/70 bg-white/70 p-4 text-sm leading-6 text-navy-700 shadow-sm">
                    <CheckCircle2 className={`mb-2 h-5 w-5 ${meta.text}`} />
                    {takeaway}
                  </div>
                ))}
              </div>
            </div>

            <ArticleArtwork article={article} />
          </div>
        </div>
      </section>

      <article className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(280px,0.28fr)] lg:items-start">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="mb-8 rounded-3xl bg-navy-900 p-6 text-white shadow-lg shadow-navy-900/15">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-copper-200">
                <Sparkles className="h-4 w-4" />
                Foundation Lens
              </div>
              <h2 className="text-2xl font-bold">{article.heroTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-navy-100/82">{article.heroSubtitle}</p>
            </div>

            {article.customHtml ? (
              <div
                className="article-content space-y-5 text-base leading-8 text-slate-700 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-navy-900 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-navy-900 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-navy-900 [&_p]:leading-8 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:ml-6 [&_ol]:list-decimal [&_li]:mb-2 [&_img]:my-6 [&_img]:rounded-2xl [&_img]:shadow-lg"
                dangerouslySetInnerHTML={{ __html: article.customHtml }}
              />
            ) : (
              <div className="space-y-9">
                {article.sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="text-2xl font-bold tracking-tight text-navy-900">{section.heading}</h2>
                    <div className="mt-4 space-y-4">
                      {section.body.map((paragraph) => (
                        <p key={paragraph} className="text-base leading-8 text-slate-700">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {section.bullets && (
                      <div className={`mt-5 rounded-2xl border ${meta.border} bg-gradient-to-br ${meta.gradient} p-5`}>
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-navy-700">Action points</p>
                        <ul className="space-y-3">
                          {section.bullets.map((bullet) => (
                            <li key={bullet} className="flex gap-3 text-sm leading-6 text-navy-700">
                              <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${meta.text}`} />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-copper-700">Chart summary</p>
              <h3 className="mt-2 text-xl font-bold text-navy-900">{article.chart.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{article.chart.subtitle}</p>
              <div className="mt-5 space-y-3">
                {article.chart.items.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm font-semibold text-navy-800">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${meta.chart}`} style={{ width: `${item.value}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-navy-900 p-5 text-white shadow-lg shadow-navy-900/15">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-copper-200">Next step</p>
              <h3 className="mt-2 text-xl font-bold">See where your foundation stands</h3>
              <p className="mt-2 text-sm leading-6 text-navy-100/78">
                The free Snapshot gives you a first read on your Foundation Score and which Building Block deserves attention first.
              </p>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/assessment/snapshot' : '/login?redirect=/assessment/snapshot')}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-copper-600 px-4 py-3 text-sm font-bold text-white hover:bg-copper-700"
              >
                Start Free Snapshot
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-copper-700">Keep Reading</p>
                <h2 className="mt-2 text-3xl font-bold text-navy-900">Related Building Blocks</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedArticles.map((related) => (
                <RelatedCard key={related.id} article={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
