import { Link } from "react-router-dom";
import { Shield, Clock, ChevronRight } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function Privacy() {
  useSEO({
    title: "Privacy Policy | Lexa AI",
    description: "Learn how Lexa AI collects, uses, and protects your information, including account data, AI conversations, and uploaded files.",
    canonicalUrl: "/privacy",
  });

  const LAST_UPDATED = "August 13, 2026";

  const SECTIONS = [
    { id: "intro", title: "1. Introduction" },
    { id: "collect", title: "2. Information We Collect" },
    { id: "use", title: "3. How We Use Information" },
    { id: "ai-processing", title: "4. AI Processing & Model Providers" },
    { id: "files", title: "5. Uploaded Files & Attachments" },
    { id: "storage", title: "6. Cookies & Local Storage" },
    { id: "analytics", title: "7. Analytics & Performance" },
    { id: "third-party", title: "8. Third-Party Services" },
    { id: "security", title: "9. Data Security" },
    { id: "retention", title: "10. Data Retention" },
    { id: "rights", title: "11. User Rights" },
    { id: "children", title: "12. Children's Privacy" },
    { id: "changes", title: "13. Changes to This Policy" },
    { id: "contact", title: "14. Contact Us" },
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
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Data Protection & Transparency</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Privacy Policy
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
                Notice: This Privacy Policy describes the actual technical data practices of the Lexa AI platform as implemented. This document serves as an operational summary and should be reviewed and finalized by legal counsel prior to formal legal reliance.
              </div>

              {/* Section 1 */}
              <section id="intro" className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">1. Introduction</h2>
                <p>
                  Lexa AI ("Lexa", "we", "us", or "our") provides an AI workspace and virtual assistant interface. This Privacy Policy describes how we collect, use, process, and safeguard your information when you access or use our website, application, APIs, and associated services.
                </p>
                <p>
                  By accessing or using Lexa AI, you acknowledge the data practices described in this policy.
                </p>
              </section>

              {/* Section 2 */}
              <section id="collect" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">2. Information We Collect</h2>
                <p>We collect information directly provided by you as well as technical data generated during your usage of the service:</p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li><strong>Account & Auth Information:</strong> Email address, password hash (managed via Supabase Auth), display name, and authentication tokens.</li>
                  <li><strong>Conversation Content:</strong> Prompts, text messages, chat transcripts, custom AI system instructions, and workspace configurations created within your account.</li>
                  <li><strong>Uploaded Files & Media:</strong> Images, PDF documents, code files, and text attachments uploaded to chat sessions for analysis.</li>
                  <li><strong>User Preferences:</strong> Selected default AI models, theme preferences (light/dark mode), voice speed settings, and custom agent parameters.</li>
                  <li><strong>Technical & Usage Information:</strong> IP address, browser type, operating system, timestamped session logs, error tracebacks, and device type.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id="use" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">3. How We Use Information</h2>
                <p>We process your information strictly for legitimate operational purposes:</p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li><strong>Providing the Service:</strong> Authentication, message routing, generating model responses, web search synthesis, and managing user workspaces.</li>
                  <li><strong>Personalization:</strong> Remembering your custom instructions, active workspace preferences, and voice options.</li>
                  <li><strong>Security & Abuse Prevention:</strong> Enforcing rate limits, detecting unauthorized access, preventing malicious uploads, and maintaining platform stability.</li>
                  <li><strong>Service Optimization:</strong> Monitoring system uptime, debugging backend errors, and improving model latency.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section id="ai-processing" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">4. AI Processing & Model Providers</h2>
                <p>
                  Lexa AI operates as an intelligent multi-model assistant interface. When you send prompts or attachments, your input data is transmitted to third-party AI model providers depending on the specific model selected for that chat session:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li><strong>OpenAI:</strong> Used when selecting GPT-4o models or DALL-E image generation.</li>
                  <li><strong>Google GenAI / Gemini:</strong> Used when selecting Gemini 1.5 Pro or Gemini Flash models.</li>
                  <li><strong>Anthropic:</strong> Used when selecting Claude 3.5 Sonnet models.</li>
                  <li><strong>ElevenLabs:</strong> Used when activating voice audio synthesis or real-time voice interactions.</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Each provider processes request payloads according to their respective developer API terms. We do not make unverified claims regarding third-party model provider internal data retention policies.
                </p>
              </section>

              {/* Section 5 */}
              <section id="files" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">5. Uploaded Files & Attachments</h2>
                <p>
                  When you upload files (such as code snippets, PDFs, or photos) into Lexa AI, they are stored temporarily or associated with your chat history for OCR extraction, image vision processing, and document analysis. You may delete your individual chat sessions to remove associated attachment references from your primary interface view.
                </p>
              </section>

              {/* Section 6 */}
              <section id="storage" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">6. Cookies & Local Storage</h2>
                <p>
                  Lexa AI uses browser <code>localStorage</code> and session tokens necessary for operating the application:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li><strong>Authentication Tokens:</strong> Secure Supabase JWT session tokens to keep you logged in.</li>
                  <li><strong>UI State & Preferences:</strong> Dark mode selection, active model choices, and collapsed sidebar states.</li>
                </ul>
                <p className="text-sm">We do not use invasive third-party cross-site advertising tracking cookies.</p>
              </section>

              {/* Section 7 */}
              <section id="analytics" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">7. Analytics & Performance</h2>
                <p>
                  We collect anonymized or aggregate performance metrics (such as average response latencies, server error rates, and API health checks) to ensure application performance and reliability.
                </p>
              </section>

              {/* Section 8 */}
              <section id="third-party" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">8. Third-Party Services</h2>
                <p>Lexa AI integrates with trusted infrastructure providers:</p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li><strong>Supabase:</strong> Database storage, user authentication, and row-level security policy enforcement.</li>
                  <li><strong>AI Model Partners:</strong> OpenAI, Anthropic, Google, and ElevenLabs.</li>
                </ul>
              </section>

              {/* Section 9 */}
              <section id="security" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">9. Data Security</h2>
                <p>
                  We implement standard administrative and technical safeguards to protect your data, including TLS encrypted data transmission in transit (HTTPS) and Supabase database authentication policies. However, no internet transmission or electronic storage method is 100% secure.
                </p>
              </section>

              {/* Section 10 */}
              <section id="retention" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">10. Data Retention</h2>
                <p>
                  Account credentials and conversation history are retained for as long as your account remains active. You may delete individual conversation threads or clear your chat history directly within the settings menu. Specific retention policies may be updated as legal requirements evolve.
                </p>
              </section>

              {/* Section 11 */}
              <section id="rights" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">11. User Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Access and update your profile information in Settings.</li>
                  <li>Delete individual chat histories or cleared threads.</li>
                  <li>Request account deletion by contacting support.</li>
                </ul>
              </section>

              {/* Section 12 */}
              <section id="children" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">12. Children's Privacy</h2>
                <p>
                  Lexa AI is not directed to children under the age of 13 (or 16 depending on local jurisdiction). We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.
                </p>
              </section>

              {/* Section 13 */}
              <section id="changes" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">13. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our service or legal requirements. Updated policies will be posted on this page with a revised "Last Updated" date.
                </p>
              </section>

              {/* Section 14 */}
              <section id="contact" className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">14. Contact Us</h2>
                <p>
                  If you have questions regarding this Privacy Policy or your personal data, please reach out to us via our contact form:
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
