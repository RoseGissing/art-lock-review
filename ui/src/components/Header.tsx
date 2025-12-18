import { Logo } from "./Logo";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Shield className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-xs font-medium text-cyan-600">FHE Protected</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <p className="hidden lg:block text-sm text-muted-foreground max-w-md">
            Anonymous Ratings, Protected by FHE.
          </p>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
            <div className="relative">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </header>
  );
};
