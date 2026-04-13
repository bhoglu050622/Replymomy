import type { Metadata, Viewport } from "next";
import { cormorantGaramond, inter, playfairDisplay } from "@/lib/fonts";
import { Toaster } from "sonner";
import { GrainOverlay } from "@/components/animations/grain-overlay";
import { PostHogProvider } from "@/components/shared/posthog-provider";
import { PostHogPageView } from "@/components/shared/posthog-pageview";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A0A0A",
};

export const metadata: Metadata = {
  title: {
    default: "The Midnight Guild | Where Exceptional Finds Exceptional",
    template: "%s | The Midnight Guild",
  },
  description:
    "A private guild for founders, creators, and icons at the pinnacle of their craft. Invitation only. Vetting mandatory. Silence guaranteed. Not everyone gets invited.",
  keywords: [
    "private network",
    "exclusive community",
    "founder network",
    "luxury connections",
    "invitation only",
    "verified network",
    "high-net-worth dating",
    "elite social club",
    "curated introductions",
    "executive networking",
  ],
  metadataBase: new URL("https://replymommy.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Midnight Guild — Not Everyone Gets Invited",
    description:
      "The 0.1% don't need dating apps. They need a guild. A private network for founders, creators, and icons who've transcended ordinary circles.",
    url: "https://replymommy.com",
    siteName: "The Midnight Guild",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "The Midnight Guild — Where Exceptional Finds Exceptional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Midnight Guild",
    description:
      "Some doors don't have handles. They're opened by recognition. An invitation-only guild for the 0.1%.",
    images: ["/api/og"],
    creator: "@replymommy",
    site: "@replymommy",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "Social Networking",
  classification: "Private Social Network",
  other: {
    "linkedin:owner": "ReplyMommy",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no",
  },
};

// JSON-LD Schema markup
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "The Midnight Guild",
  alternateName: "ReplyMommy",
  url: "https://replymommy.com",
  logo: {
    "@type": "ImageObject",
    url: "https://replymommy.com/logo.png",
    width: 512,
    height: 512,
  },
  description:
    "A private guild for founders, creators, and icons. Invitation-only network for exceptional individuals.",
  foundingDate: "2024",
  sameAs: [
    "https://x.com/ReplyMommy",
    "https://instagram.com/replymommy",
    "https://linkedin.com/company/replymommy",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Membership Inquiries",
    email: "access@replymommy.com",
    availableLanguage: ["English"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "The Midnight Guild",
  url: "https://replymommy.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://replymommy.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I join The Midnight Guild?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Access is by invitation only. You must have an existing member vouch for you, pass our verification process confirming $1M+ ARR or equivalent excellence, and agree to our discretion pact. Apply on our website to join the waitlist.",
      },
    },
    {
      "@type": "Question",
      name: "What makes The Midnight Guild different from dating apps?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We are not a dating app. We are a private guild for exceptional individuals who've transcended ordinary networks. Every member is verified for excellence, not just wealth. Our focus is on quality connections, not volume.",
      },
    },
    {
      "@type": "Question",
      name: "Is my privacy protected?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. Privacy is our foundation, not a feature. What's shared within the guild stays within the guild. We employ military-grade encryption and have a strict discretion pact that all members must agree to.",
      },
    },
    {
      "@type": "Question",
      name: "What are the membership tiers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer three tiers: Patron ($99/month) for those beginning their journey, Fellow ($299/month) which is our most popular tier with unlimited introductions, and Principal ($999/month) which includes personal matchmaking and exclusive IRL experiences.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${inter.variable} ${playfairDisplay.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://www.unicorn.studio" />
        <link rel="dns-prefetch" href="https://www.unicorn.studio" />
      </head>
      <body className="min-h-full flex flex-col bg-obsidian text-ivory antialiased">
        <PostHogProvider>
          <PostHogPageView />
          <GrainOverlay />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1A1A1A",
                border: "1px solid rgba(201, 168, 76, 0.2)",
                color: "#F5F0E8",
                borderRadius: "1rem",
                fontSize: "0.875rem",
              },
            }}
          />
        </PostHogProvider>
      </body>
    </html>
  );
}
