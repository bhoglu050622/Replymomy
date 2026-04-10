"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, BookOpen } from "lucide-react";
import type { Article } from "@/lib/knowledge/articles";

interface Props {
  article: Article;
  children: ReactNode;
}

export function KnowledgeArticleSheet({ article, children }: Props) {
  const [open, setOpen] = useState(false);

  // Convert simple markdown-ish body to paragraphs
  function renderBody(body: string) {
    return body.split("\n\n").map((block, i) => {
      if (block.startsWith("**") && block.endsWith("**") && !block.slice(2).includes("**")) {
        return (
          <h4 key={i} className="font-medium text-champagne text-body-md mt-5 mb-2">
            {block.replace(/\*\*/g, "")}
          </h4>
        );
      }
      // Bold inline
      const parts = block.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="text-body-md text-ivory/75 leading-relaxed">
          {parts.map((p, j) =>
            p.startsWith("**") ? (
              <strong key={j} className="text-ivory font-medium">
                {p.replace(/\*\*/g, "")}
              </strong>
            ) : (
              p
            )
          )}
        </p>
      );
    });
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[150] bg-obsidian/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed inset-y-0 right-0 z-[151] w-full max-w-lg bg-[#111111] border-l border-champagne/10 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#111111]/95 backdrop-blur-xl border-b border-champagne/10 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-label text-champagne">
                  <BookOpen className="size-4" />
                  {article.category}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="size-8 rounded-full bg-smoke flex items-center justify-center text-ivory/60 hover:text-ivory transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-8 space-y-6">
                <div>
                  <h2 className="text-display-md text-ivory mb-3 leading-tight">
                    {article.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-label text-ivory/30">
                    <Clock className="size-3" />
                    {article.readMins} min read
                  </div>
                </div>

                <p className="text-body-md text-champagne/80 italic border-l-2 border-champagne/30 pl-4">
                  {article.excerpt}
                </p>

                <div className="space-y-3">
                  {renderBody(article.body)}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
