import { BookOpen, Clock, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getArticlesForRole, type Article, type ArticleCategory } from "@/lib/knowledge/articles";
import { KnowledgeArticleSheet } from "@/components/dashboard/knowledge-article-sheet";

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  Basics: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  Tokens: "text-champagne bg-champagne/10 border-champagne/20",
  Privacy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Features: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  Culture: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  Matching: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  Earnings: "text-champagne bg-champagne/10 border-champagne/20",
  Payouts: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Profile: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  Calendar: "text-sky-400 bg-sky-400/10 border-sky-400/20",
};

export default async function KnowledgePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userRecord } = await supabase
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();

  const role = (userRecord?.role ?? "member") as "member" | "mommy" | "admin";
  const articles = getArticlesForRole(role);

  const categories = [...new Set(articles.map((a) => a.category))];

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-label text-champagne mb-3">
          <BookOpen className="size-4" />
          Knowledge Hub
        </div>
        <h1 className="text-display-lg text-ivory mb-3">
          The Guild <span className="italic text-champagne">library.</span>
        </h1>
        <p className="text-body-md text-ivory/50 max-w-xl">
          {role === "mommy"
            ? "Everything you need to maximise your presence, earnings, and standing in the guild."
            : "Everything you need to navigate the guild with intention and confidence."}
        </p>
      </div>

      {/* Articles by category */}
      {categories.map((cat) => {
        const catArticles = articles.filter((a) => a.category === cat);
        return (
          <section key={cat} className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span
                className={`px-3 py-1 rounded-full text-label border ${CATEGORY_COLORS[cat]}`}
              >
                {cat}
              </span>
              <div className="h-px flex-1 bg-champagne/10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <KnowledgeArticleSheet article={article}>
      <div className="group p-5 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-all cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${CATEGORY_COLORS[article.category]}`}
          >
            {article.category}
          </span>
          {article.isNew && (
            <span className="flex items-center gap-1 text-[10px] text-champagne">
              <Sparkles className="size-3" /> New
            </span>
          )}
        </div>

        <h3 className="text-body-md font-medium text-ivory mb-2 group-hover:text-champagne transition-colors leading-snug">
          {article.title}
        </h3>
        <p className="text-body-sm text-ivory/50 flex-1 line-clamp-2 mb-4">
          {article.excerpt}
        </p>

        <div className="flex items-center gap-1.5 text-label text-ivory/30">
          <Clock className="size-3" />
          {article.readMins} min read
        </div>
      </div>
    </KnowledgeArticleSheet>
  );
}
