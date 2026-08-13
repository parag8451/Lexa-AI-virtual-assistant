import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2,
  HelpCircle, ArrowRight, Sparkles, Building2, Headset
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSEO } from "@/hooks/useSEO";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function Contact() {
  useSEO({
    title: "Contact Lexa AI",
    description: "Get in touch with the Lexa AI team for questions, technical support, feedback, partnerships, or business inquiries.",
    canonicalUrl: "/contact",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "General Question",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successResponse, setSuccessResponse] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      errs.subject = "Subject is required";
    } else if (formData.subject.trim().length < 3) {
      errs.subject = "Subject must be at least 3 characters";
    }

    if (!formData.message.trim()) {
      errs.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessResponse(null);
    setErrorMessage(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Backend integration endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit contact request.");
      }

      setSuccessResponse(data.message || "Thank you! Your message has been received.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "General Question",
        message: "",
      });
      setErrors({});
    } catch (err: any) {
      console.error("Contact Form Submission Error:", err);
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <PublicNavbar />

      <main className="flex-1 py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">

          {/* ──────── Hero ──────── */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/40 backdrop-blur-md text-xs font-medium mb-6">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">We'd love to hear from you</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Let's Talk
            </h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              Have questions, feedback, technical inquiries, or partnership proposals? Drop us a message below and our team will be in touch.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* ──────── Contact Form ──────── */}
            <div className="lg:col-span-7">
              <div className="p-8 md:p-10 rounded-[2.5rem] border border-border/40 bg-card shadow-xl">
                <h2 className="text-2xl font-bold tracking-tight mb-6">Send us a Message</h2>

                {/* Success Alert */}
                {successResponse && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm font-medium leading-relaxed">{successResponse}</div>
                  </div>
                )}

                {/* Error Alert */}
                {errorMessage && (
                  <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm font-medium leading-relaxed">{errorMessage}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-sm font-semibold">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contact-name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        className={`rounded-xl h-12 bg-background border-border/60 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {errors.name && (
                        <p id="name-error" className="text-xs text-destructive font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" /> {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-email" className="text-sm font-semibold">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className={`rounded-xl h-12 bg-background border-border/60 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-xs text-destructive font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category Select */}
                  <div className="space-y-2">
                    <Label htmlFor="contact-category" className="text-sm font-semibold">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(val) => setFormData({ ...formData, category: val })}
                    >
                      <SelectTrigger id="contact-category" className="h-12 rounded-xl bg-background border-border/60">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Question">General Question</SelectItem>
                        <SelectItem value="Technical Support">Technical Support</SelectItem>
                        <SelectItem value="Feedback">Feedback</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                        <SelectItem value="Business Inquiry">Business Inquiry</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject Input */}
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject" className="text-sm font-semibold">
                      Subject <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contact-subject"
                      type="text"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      aria-required="true"
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? "subject-error" : undefined}
                      className={`rounded-xl h-12 bg-background border-border/60 ${errors.subject ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.subject && (
                      <p id="subject-error" className="text-xs text-destructive font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="space-y-2">
                    <Label htmlFor="contact-message" className="text-sm font-semibold">
                      Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="contact-message"
                      rows={5}
                      placeholder="Write your message details here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      className={`rounded-xl bg-background border-border/60 ${errors.message ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-xs text-destructive font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-13 rounded-full text-base font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-95"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        Send Message <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* ──────── Sidebar Options ──────── */}
            <div className="lg:col-span-5 space-y-6">

              {/* Support Card */}
              <div className="p-8 rounded-[2.5rem] border border-border/40 bg-muted/20 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Headset className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Need In-App Support?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  If you are experiencing issues within your workspace, our interactive AI support widget is available right inside your chat dashboard.
                </p>
                <Button asChild variant="outline" className="rounded-full h-11 px-6 text-sm font-medium w-full">
                  <Link to="/chat">
                    Go to Workspace <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {/* Useful Links Card */}
              <div className="p-8 rounded-[2.5rem] border border-border/40 bg-card space-y-4">
                <h3 className="text-lg font-bold tracking-tight">Quick Navigation</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/about"
                    className="p-3 rounded-xl border border-border/40 bg-background hover:bg-muted/40 transition-colors text-xs font-semibold flex items-center justify-between"
                  >
                    <span>About Lexa</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    to="/pricing"
                    className="p-3 rounded-xl border border-border/40 bg-background hover:bg-muted/40 transition-colors text-xs font-semibold flex items-center justify-between"
                  >
                    <span>Pricing Plans</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    to="/privacy"
                    className="p-3 rounded-xl border border-border/40 bg-background hover:bg-muted/40 transition-colors text-xs font-semibold flex items-center justify-between"
                  >
                    <span>Privacy Policy</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    to="/terms"
                    className="p-3 rounded-xl border border-border/40 bg-background hover:bg-muted/40 transition-colors text-xs font-semibold flex items-center justify-between"
                  >
                    <span>Terms & Conditions</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
