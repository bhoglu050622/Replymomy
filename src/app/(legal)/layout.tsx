import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian">
      <header className="border-b border-champagne/10 px-6 lg:px-12 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/" className="text-label text-ivory/40 hover:text-ivory transition-colors">
            ← Back
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {children}
      </main>
      <footer className="border-t border-champagne/10 px-6 lg:px-12 py-8 text-center">
        <div className="flex items-center justify-center gap-6 text-label text-ivory/30">
          <Link href="/privacy" className="hover:text-champagne transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-champagne transition-colors">Terms of Entry</Link>
          <span>·</span>
          <a href="mailto:legal@replymommy.com" className="hover:text-champagne transition-colors">legal@replymommy.com</a>
        </div>
      </footer>
    </div>
  );
}
