import { Link } from "react-router-dom";
import { Scale, Clock, ChevronRight } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function Terms() {
  useSEO({
    title: "Terms & Conditions | Lexa AI",
    description: "Review the Terms of Service and Conditions for using Lexa AI's workspace, models, and features.",
    canonicalUrl: "/terms",
  });

  const LAST_UPDATED = "August 13, 2026";

  const SECTIONS = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "description", title: "2. Description of Lexa" },
    { id: "accounts", title: "3. User Accounts & Security" },
    { id: "acceptable-use", title: "4. Acceptable Use Policy" },
    { id: "ai-content", title: "5. AI-Generated Content Disclaimer" },
    { id: "user-content", title: "6. User Content & Ownership" },
    { id: "third-party", title: "7. Third-Party AI Providers" },
    { id: "billing", title: "8. Plans, Usage & Billing" },
    { id: "ip", title: "9. Intellectual Property" },
    { id: "availability", title: "10. Service Availability" },
    { id: "disclaimer", title: "11. Disclaimer of Warranties" },
    { id: "liability", title: "12. Limitation of Liability" },
    { id: "termination", title: "13. Account Termination" },
    { id: "changes", title: "14. Changes to Terms" },
    { id: "contact", title: "15. Contact Information" },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <PublicNavbar />

      <main className="flex-1 py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">

          {/* ──────── Header Banner ──────── */}
          <div className="mb-12 border-b border-border/40 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/40 backdrop-blur-md text-xs font-medium mb-4">
              <Scale className="w-3.5 h-3.5 text-primary" />
              <span>Platform Terms & User Agreement</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Terms & Conditions
            </h1>

            <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
              <Clock className="w-4 h-4 text-primary" />
              <span>Last updated: {LAST_UPDATED}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* ──────── Sticky Table of Contents (Desktop) ──────── */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-24 p-6 rounded-3xl border border-border/40 bg-card/50 backdrop-blur-md shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Table of Contents
              </h2>
              <nav className="space-y-2 text-xs font-medium">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className="w-full text-left py-1.5 px-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-between"
                  >
                    <span>{sec.title}</span>
                    <ChevronRight className="w-3 h-3 opacity-50" />
                  </button>
                ))}
              </nav>
            </aside>

            {/* ──────── Document Content ──────── */}
            <article className="lg:col-span-8 space-y-12 text-foreground/90 font-light leading-relaxed">

              {/* Notice Banner */}
              <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium leading-relaxed">
                Notice: These Terms & Conditions govern your use of the Lexa AI SaaS application and services. This document represents a product-aligned operational framework and should be finalized by qualified legal counsel.
              </div>

              {/* Section 1 */}
              <section id="acceptance" className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">1. Acceptance of Terms</h2>
                <p>
                  By creating an account, accessing, or using Lexa AI ("Platform", "Service"), you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree to all of these Terms, you may not access or use the Service.
                </p>
              </section>

              {/* Section 2 */}
              <section id="description" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">2. Description of Lexa</h2>
                <p>
                  Lexa AI is an artificial intelligence SaaS platform providing conversational assistance, multi-model intelligence routing, web search synthesis, voice AI features, file analysis, and image/video generation capabilities. Features available to you depend on your account tier and workspace configurations.
                </p>
              </section>

              {/* Section 3 */}
              <section id="accounts" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">3. User Accounts & Security</h2>
                <p>
                  When registering an account, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized account access.
                </p>
              </section>

              {/* Section 4 */}
              <section id="acceptable-use" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">4. Acceptable Use Policy</h2>
                <p>You agree not to misuse the Service. Specifically, you agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Use the Service for any illegal, fraudulent, or harmful activity.</li>
                  <li>Bypass rate limits, security measures, or access controls.</li>
                  <li>Upload malicious software, viruses, or exploit payloads.</li>
                  <li>Attempt to gain unauthorized access to backend APIs or databases.</li>
                  <li>Automate scraping or bulk query extraction without prior written approval.</li>
                  <li>Generate content that promotes harassment, hate speech, or severe harm.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id="ai-content" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">5. AI-Generated Content Disclaimer</h2>
                <p>
                  Lexa AI utilizes probabilistic artificial intelligence models. <strong>Outputs generated by AI may contain errors, inaccuracies, or incomplete information.</strong>
                </p>
                <p>
                  You are solely responsible for evaluating, verifying, and testing any code, text, legal snippets, or information generated by Lexa AI before relying on it for professional, medical, financial, or technical decisions. We make no guarantees regarding AI output accuracy.
                </p>
              </section>

              {/* Section 6 */}
              <section id="user-content" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">6. User Content & Ownership</h2>
                <p>
                  You retain ownership of the prompts, text, images, and files you upload to the Service ("User Content"). Subject to these Terms and third-party provider licenses, you own the outputs generated from your lawful prompts, subject to your compliance with applicable laws.
                </p>
              </section>

              {/* Section 7 */}
              <section id="third-party" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">7. Third-Party AI Providers</h2>
                <p>
                  Lexa AI interfaces with third-party model providers (including OpenAI, Anthropic, Google, and ElevenLabs). By using these specific models, your request data is routed to those providers for execution according to their API operations.
                </p>
              </section>

              {/* Section 8 */}
              <section id="billing" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">8. Plans, Usage & Billing</h2>
                <p>
                  Lexa AI offers Free, Pro, and Team usage tiers. Free tiers include daily message allowances and standard model access. Premium tiers unlock higher rate limits and advanced model options. Billing terms for paid subscriptions are managed as described during checkout.
                </p>
              </section>

              {/* Section 9 */}
              <section id="ip" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">9. Intellectual Property</h2>
                <p>
                  The Lexa AI brand, logo, application code, user interface designs, and proprietary platform infrastructure belong to Lexa AI and its licensors. You may not copy, reverse engineer, or redistribute our platform without explicit authorization.
                </p>
              </section>

              {/* Section 10 */}
              <section id="availability" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">10. Service Availability</h2>
                <p>
                  We strive for high uptime and system stability, but we do not guarantee uninterrupted or error-free service availability. Maintenance, updates, or provider outages may cause temporary downtime.
                </p>
              </section>

              {/* Section 11 */}
              <section id="disclaimer" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">11. Disclaimer of Warranties</h2>
                <p>
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO FITNESS FOR A PARTICULAR PURPOSE OR NON-INFRINGEMENT.
                </p>
              </section>

              {/* Section 12 */}
              <section id="liability" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">12. Limitation of Liability</h2>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, LEXA AI AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
                </p>
              </section>

              {/* Section 13 */}
              <section id="termination" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">13. Account Termination</h2>
                <p>
                  We reserve the right to suspend or terminate your account if you violate these Terms or engage in abusive behavior that threatens the security or availability of the platform.
                </p>
              </section>

              {/* Section 14 */}
              <section id="changes" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">14. Changes to Terms</h2>
                <p>
                  We may revise these Terms at any time. Material updates will be communicated by posting the updated Terms on this page with a revised "Last Updated" date.
                </p>
              </section>

              {/* Section 15 */}
              <section id="contact" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">15. Contact Information</h2>
                <p>
                  For questions or legal inquiries concerning these Terms, please contact us:
                </p>
                <p className="pt-2">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Go to Contact Page
                  </Link>
                </p>
              </section>

            </article>

          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
