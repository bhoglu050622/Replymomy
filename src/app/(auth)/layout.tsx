import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <header className="px-6 lg:px-12 py-8">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="px-6 py-8 text-center">
        <p className="text-label text-ivory/30">
          Discretion is the ultimate luxury.
        </p>
      </footer>
    </div>
  );
}
