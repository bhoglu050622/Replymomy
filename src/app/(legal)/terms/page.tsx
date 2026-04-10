export const metadata = {
  title: "Terms of Entry — The Midnight Guild",
  description: "The terms and conditions governing membership and use of The Midnight Guild.",
};

export default function TermsPage() {
  return (
    <article className="prose-legal">
      <div className="mb-12">
        <p className="text-label text-champagne tracking-widest uppercase mb-4">Legal</p>
        <h1 className="font-headline text-4xl lg:text-5xl text-ivory mb-4">Terms of Entry</h1>
        <p className="text-body-sm text-ivory/40">Last updated: April 10, 2026</p>
      </div>

      <div className="w-24 h-px bg-gradient-to-r from-transparent via-champagne/40 to-transparent mb-12" />

      <p className="text-body-sm text-ivory/60 mb-10">
        These Terms of Entry (&ldquo;Terms&rdquo;) govern your access to and use of The Midnight Guild platform
        operated at replymommy.com (&ldquo;Platform,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;). By creating an account or
        accessing the Platform, you agree to be bound by these Terms. If you do not agree, do not
        use the Platform.
      </p>

      <Section title="1. Eligibility">
        <p>
          You must be at least 18 years of age to use this Platform. By creating an account, you
          represent and warrant that you are 18 or older and have the legal capacity to enter into
          binding contracts. Membership is invitation-only; creating an account requires a valid
          invitation code issued by The Midnight Guild.
        </p>
        <p>
          Identity verification is mandatory. You agree to undergo verification through our
          third-party identity provider. Providing false information during verification is grounds
          for immediate permanent termination.
        </p>
      </Section>

      <Section title="2. Accounts">
        <p>
          You are responsible for maintaining the confidentiality of your credentials and for all
          activity that occurs under your account. You must not share your account, invitation
          code, or credentials with any other person. Each invitation code grants access to one
          account only. Accounts are personal and non-transferable.
        </p>
        <p>
          You agree to keep your profile information accurate and up to date. Profile photos must
          depict you accurately and must not be AI-generated, heavily edited beyond recognition,
          or depict another person.
        </p>
      </Section>

      <Section title="3. Subscriptions and Payments">
        <Subsection title="Recurring Subscriptions">
          Patron, Fellow, and Principal memberships are billed monthly on a recurring basis.
          Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date.
          You authorise The Midnight Guild to charge your designated payment method on each
          renewal date.
        </Subsection>
        <Subsection title="Token Purchases">
          Rose Tokens are one-time purchases and do not expire for the lifetime of your account.
          Tokens have no cash value and cannot be transferred, refunded, or redeemed for currency.
        </Subsection>
        <Subsection title="Refund Policy">
          All subscription payments are non-refundable once access to the Platform has been
          granted for that billing period. If you believe you were charged in error, contact
          support@replymommy.com within 7 days of the charge.
        </Subsection>
        <Subsection title="Regional Pricing">
          We offer locally adjusted pricing in certain markets as a courtesy. The price displayed
          at checkout is the price you will be charged. Prices are subject to change with 14 days&rsquo;
          notice.
        </Subsection>
      </Section>

      <Section title="4. Acceptable Use">
        <p>You agree not to:</p>
        <ul>
          <li>Harass, threaten, defame, or demean any other member</li>
          <li>Share another member&rsquo;s personal information without their explicit consent</li>
          <li>Use the Platform for commercial solicitation, spam, or multi-level marketing</li>
          <li>Upload content that is illegal, obscene, or that depicts non-consensual activity</li>
          <li>Create multiple accounts or impersonate another person</li>
          <li>Use bots, scrapers, or automated tools to access or interact with the Platform</li>
          <li>Attempt to reverse-engineer, hack, or compromise the Platform&rsquo;s security</li>
          <li>Screenshot, record, or distribute conversations or profile content without consent</li>
        </ul>
        <p>
          Discretion is a condition of membership. Information shared on this Platform — including
          identities, relationships, and communications — must be treated as strictly confidential.
          Breaching confidentiality is grounds for immediate account termination and may give rise
          to legal liability.
        </p>
      </Section>

      <Section title="5. Content">
        <p>
          You retain ownership of content you submit (photos, messages, profile information). By
          uploading content, you grant The Midnight Guild a limited, non-exclusive, royalty-free
          licence to store, display, and process that content solely for the purpose of operating
          the Platform. We will not use your content in marketing materials without your explicit
          written consent.
        </p>
        <p>
          You are solely responsible for the content you share. You represent that you own or
          have the rights to all content you upload and that doing so does not violate any
          third-party rights.
        </p>
      </Section>

      <Section title="6. Guild Conduct and Matching">
        <p>
          The Midnight Guild facilitates introductions between members. We do not guarantee
          compatibility, relationship outcomes, or the accuracy of members&rsquo; self-representations.
          Introductions are curated by our algorithm; we make no warranty that introductions
          will meet your expectations. You engage with other members at your own discretion and
          risk.
        </p>
        <p>
          The Platform is a social club, not a dating agency. No relationship outcome — romantic,
          professional, or otherwise — is guaranteed. Membership fees are for access to the
          Platform, not for any specific matching result.
        </p>
      </Section>

      <Section title="7. Personal Liaison (Principal Tier)">
        <p>
          Principal (Black Card) members receive access to a Personal Liaison service delivered
          via the in-app messaging channel. The Liaison assists with scheduling, communication
          facilitation, and discretion management between members. The Liaison is available on
          a best-efforts basis; response times are typically within 2 hours but are not
          guaranteed. The Liaison does not provide legal, financial, or medical advice.
        </p>
      </Section>

      <Section title="8. Termination">
        <p>
          We reserve the right to suspend or permanently terminate your account at our sole
          discretion for violations of these Terms, behaviour we determine to be harmful to
          other members or the Platform, or any reason we deem necessary to protect the Guild
          community. Upon termination, your access to the Platform ceases immediately.
          Subscription fees paid for the current billing period are non-refundable.
        </p>
        <p>
          You may cancel your account at any time by contacting support@replymommy.com. Account
          deletion is processed within 30 days.
        </p>
      </Section>

      <Section title="9. Intellectual Property">
        <p>
          All Platform content, design, branding, algorithms, and technology are the exclusive
          property of The Midnight Guild and its licensors. You may not reproduce, distribute,
          modify, or create derivative works without written permission. The names &ldquo;The Midnight
          Guild,&rdquo; &ldquo;ReplyMommy,&rdquo; and associated marks are proprietary.
        </p>
      </Section>

      <Section title="10. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, The Midnight Guild and its operators
          shall not be liable for any indirect, incidental, special, consequential, or punitive
          damages arising from your use of the Platform, including but not limited to loss of
          data, relationship outcomes, or interaction with other members. Our total aggregate
          liability for any claim shall not exceed the amount you paid us in the 12 months
          preceding the claim.
        </p>
        <p>
          The Platform is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied.
          We do not warrant that the Platform will be uninterrupted, error-free, or secure.
        </p>
      </Section>

      <Section title="11. Indemnification">
        <p>
          You agree to indemnify and hold harmless The Midnight Guild and its operators from any
          claims, losses, liabilities, and expenses (including reasonable attorneys&rsquo; fees) arising
          from your use of the Platform, your content, or your violation of these Terms.
        </p>
      </Section>

      <Section title="12. Governing Law and Disputes">
        <p>
          These Terms are governed by the laws of the State of Delaware, USA, without regard to
          conflict of law principles. Any dispute arising under these Terms shall be resolved
          through binding individual arbitration administered by the American Arbitration
          Association under its Consumer Arbitration Rules. You waive any right to participate
          in a class action or class-wide arbitration. The arbitration shall take place in
          Delaware or, at your option, via remote hearing.
        </p>
        <p>
          Notwithstanding the foregoing, either party may seek emergency injunctive relief in
          any court of competent jurisdiction.
        </p>
      </Section>

      <Section title="13. Changes to These Terms">
        <p>
          We may update these Terms. We will provide at least 14 days&rsquo; notice of material changes
          via email. Continued use after the effective date constitutes acceptance of the revised
          Terms. If you do not agree to the changes, you may close your account before the
          effective date.
        </p>
      </Section>

      <Section title="14. Miscellaneous">
        <p>
          If any provision of these Terms is found unenforceable, the remaining provisions
          continue in full force. Our failure to enforce any right does not constitute a waiver
          of that right. These Terms, together with our Privacy Policy, constitute the entire
          agreement between you and The Midnight Guild.
        </p>
      </Section>

      <Section title="15. Contact">
        <p>
          Questions about these Terms:{" "}
          <a href="mailto:legal@replymommy.com">legal@replymommy.com</a>
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
