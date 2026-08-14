import { Link } from "react-router-dom";
import { Twitter, Github, Linkedin } from "lucide-react";
import { LogoIcon } from "@/components/ui/LogoIcon";

export function PricingFooter() {
  return (
    <footer className="bg-[#050914] border-t border-border/20 pt-16 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <LogoIcon className="h-5 w-5 rounded-md" />
              <span className="font-bold text-lg tracking-tight text-white">Lexa AI</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Your personal AI workspace. Powered by the world's most advanced models, designed with meticulous attention to detail.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Github className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#models" className="hover:text-indigo-400 transition-colors">AI Models</a></li>
              <li><Link to="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
              <li><a href="#api" className="hover:text-indigo-400 transition-colors">API</a></li>
              <li><a href="#changelog" className="hover:text-indigo-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#docs" className="hover:text-indigo-400 transition-colors">Documentation</a></li>
              <li><a href="#guides" className="hover:text-indigo-400 transition-colors">Guides</a></li>
              <li><a href="#blog" className="hover:text-indigo-400 transition-colors">Blog</a></li>
              <li><a href="#help" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Lexa AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
