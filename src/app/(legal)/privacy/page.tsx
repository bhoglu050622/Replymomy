export const metadata = {
  title: "Privacy Policy — The Midnight Guild",
  description: "How The Midnight Guild collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <article className="prose-legal">
      <div className="mb-12">
        <p className="text-label text-champagne tracking-widest uppercase mb-4">Legal</p>
        <h1 className="font-headline text-4xl lg:text-5xl text-ivory mb-4">Privacy Policy</h1>
        <p className="text-body-sm text-ivory/40">Last updated: April 10, 2026</p>
      </div>

      <div className="w-24 h-px bg-gradient-to-r from-transparent via-champagne/40 to-transparent mb-12" />

      <Section title="1. Introduction">
        <p>
          The Midnight Guild (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the invitation-only social platform
          at replymommy.com. This Privacy Policy describes how we collect, use, and safeguard your
          personal information when you use our service. By accessing or using the platform, you
          agree to the practices described herein.
        </p>
        <p>
          Discretion is foundational to our identity. We do not sell your data, profile your
          behaviour for advertising, or share your information with any party not listed in this
          policy.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <Subsection title="Account Information">
          When you apply for or create an account, we collect: full name, email address, date of
          birth, city of residence, Instagram handle (optional), profile photos, personal bio,
          and stated preferences.
        </Subsection>
        <Subsection title="Identity Verification">
          We use Persona Inc. to verify identity. Persona may collect government-issued ID data
          and a selfie on our behalf, subject to Persona&rsquo;s own privacy policy. We receive only a
          verification status — we do not store copies of identity documents.
        </Subsection>
        <Subsection title="Payment Information">
          Payment processing is handled by DodoPayments. We do not store card numbers, bank
          account details, or full payment credentials. We store only subscription status, tier,
          and a DodoPayments customer identifier.
        </Subsection>
        <Subsection title="Usage Data">
          We collect server-side logs including IP address, browser type, pages visited, and
          feature interactions. This data is used exclusively for security, fraud prevention, and
          service improvement. It is never used for advertising profiles.
        </Subsection>
        <Subsection title="Communications">
          Chat messages between members are processed by Stream, Inc. and are stored on Stream&rsquo;s
          infrastructure. Messages are encrypted in transit. We do not read private messages unless
          required by a valid legal order or when investigating a reported safety violation.
        </Subsection>
      </Section>

      <Section title="3. How We Use Your Information">
        <ul>
          <li>To operate the matching algorithm and surface curated introductions</li>
          <li>To verify your identity and enforce membership standards</li>
          <li>To process subscriptions, token purchases, and gift transactions</li>
          <li>To send transactional emails (welcome, receipts, match notifications)</li>
          <li>To investigate and prevent fraud, abuse, or policy violations</li>
          <li>To comply with applicable legal obligations</li>
        </ul>
        <p>
          We do not use your information for targeted advertising. We do not sell, rent, or trade
          your personal data to third parties for marketing purposes.
        </p>
      </Section>

      <Section title="4. Third-Party Services">
        <p>We share limited data with the following processors to operate the service:</p>
        <table>
          <thead>
            <tr>
              <th>Processor</th>
              <th>Purpose</th>
              <th>Data Shared</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>DodoPayments</td>
              <td>Payment processing</td>
              <td>Email, name, billing country</td>
            </tr>
            <tr>
              <td>Supabase</td>
              <td>Database &amp; authentication</td>
              <td>All user data (encrypted at rest)</td>
            </tr>
            <tr>
              <td>Stream, Inc.</td>
              <td>Real-time chat</td>
              <td>User ID, display name, messages</td>
            </tr>
            <tr>
              <td>Cloudinary</td>
              <td>Photo storage &amp; delivery</td>
              <td>Profile and gallery photos</td>
            </tr>
            <tr>
              <td>Persona Inc.</td>
              <td>Identity verification</td>
              <td>Verification request only</td>
            </tr>
            <tr>
              <td>Resend</td>
              <td>Transactional email</td>
              <td>Email address, message content</td>
            </tr>
          </tbody>
        </table>
        <p>
          All processors are contractually bound to use your data only for the specified purpose
          and to maintain appropriate security standards.
        </p>
      </Section>

      <Section title="5. Your Rights">
        <p>Depending on your jurisdiction, you have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
          <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
          <li><strong>Erasure:</strong> Request deletion of your account and personal data</li>
          <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
          <li><strong>Restriction:</strong> Ask us to limit processing in certain circumstances</li>
          <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
        </ul>
        <p>
          To exercise any of these rights, email{" "}
          <a href="mailto:privacy@replymommy.com">privacy@replymommy.com</a>. We will respond
          within 30 days. For identity verification purposes, we may ask you to confirm your
          email address before processing a request.
        </p>
      </Section>

      <Section title="6. Data Retention">
        <p>
          Active account data is retained for as long as your account remains open. Upon account
          deletion, personal profile data is removed within 30 days. Transaction records (payment
          history, subscription records) are retained for 7 years as required by financial
          regulations. Anonymised usage statistics may be retained indefinitely.
        </p>
      </Section>

      <Section title="7. Security">
        <p>
          We employ industry-standard security measures including TLS encryption for all data in
          transit, AES-256 encryption at rest via Supabase, bcrypt-hashed authentication
          credentials, row-level security policies isolating user data, and regular third-party
          security assessments. No method of transmission or storage is 100% secure. We will
          notify affected members within 72 hours of becoming aware of a breach that presents
          a high risk to your rights and freedoms.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          We use only essential cookies required for authentication and session management.
          We do not use tracking cookies, advertising pixels, or third-party analytics cookies.
          The cookies we set include: a Supabase session token (httpOnly, secure, same-site
          Strict) and a country preference cookie (used for regional pricing display only,
          expires in 1 hour).
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          The Midnight Guild is strictly for adults aged 18 and over. We do not knowingly
          collect personal data from individuals under 18. If we discover that a minor has
          created an account, we will delete that account and all associated data immediately.
        </p>
      </Section>

      <Section title="10. International Transfers">
        <p>
          Our infrastructure is operated primarily within the United States (Supabase, Vercel).
          If you are located in the European Economic Area, United Kingdom, or other regions with
          data transfer restrictions, your data is processed under applicable Standard Contractual
          Clauses or equivalent safeguards.
        </p>
      </Section>

      <Section title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy to reflect changes in our practices or legal
          requirements. We will notify members of material changes via email at least 14 days
          before the change takes effect. Continued use after the effective date constitutes
          acceptance of the updated policy.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          Questions, concerns, or requests relating to this Privacy Policy:{" "}
          <a href="mailto:privacy@replymommy.com">privacy@replymommy.com</a>
        </p>
        <p className="text-ivory/40 text-body-sm">
          The Midnight Guild · replymommy.com · Operated under Delaware, USA law
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="font-headline text-2xl text-ivory mb-4">{title}</h2>
      <div className="space-y-4 text-body-sm text-ivory/65 leading-relaxed">{children}</div>
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-label text-champagne mb-2 uppercase tracking-wide">{title}</h3>
      <p className="text-body-sm text-ivory/65 leading-relaxed">{children}</p>
    </div>
  );
}
