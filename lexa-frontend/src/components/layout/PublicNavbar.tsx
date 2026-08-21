import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {  Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

import { LogoIcon } from "@/components/ui/LogoIcon";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setIsAuthenticated(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { label: "Features", href: "/#features", isHash: true },
    { label: "Models", href: "/#models", isHash: true },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    setMobileMenuOpen(false);
    if (link.isHash) {
      if (location.pathname === "/") {
        const targetId = link.href.replace("/#", "");
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate(link.href);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <LogoIcon className="w-8 h-8 rounded-xl group-hover:scale-105 transition-transform" />
          <span className="text-xl font-bold tracking-tight text-foreground">Lexa</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            if (link.isHash) {
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </button>
              );
            }
            return (
              <Link
                key={link.label}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Button
              onClick={() => navigate("/chat")}
              className="rounded-full h-10 px-5 font-medium shadow-sm transition-transform active:scale-95"
            >
              Open Chat <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/chat")}
                className="rounded-full h-10 text-sm font-medium"
              >
                Log in
              </Button>
              <Button
                onClick={() => navigate("/chat")}
                className="rounded-full h-10 px-5 font-medium shadow-sm transition-transform active:scale-95"
              >
                Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur-2xl px-4 py-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            if (link.isHash) {
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="text-left text-lg font-medium py-2 text-muted-foreground hover:text-foreground border-b border-border/20"
                >
                  {link.label}
                </button>
              );
            }
            return (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg font-medium py-2 border-b border-border/20 ${
                  location.pathname === link.href ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="flex flex-col gap-3 mt-4">
            {isAuthenticated ? (
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/chat");
                }}
                className="w-full justify-center rounded-full h-12 text-base font-medium"
              >
                Open Chat <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/chat");
                  }}
                  className="w-full justify-center rounded-full h-12 text-base font-medium"
                >
                  Log in
                </Button>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/chat");
                  }}
                  className="w-full justify-center rounded-full h-12 text-base font-medium"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
