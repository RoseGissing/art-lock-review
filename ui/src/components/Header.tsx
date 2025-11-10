import { Logo } from "./Logo";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-6">
          <p className="hidden md:block text-sm text-muted-foreground max-w-md">
            Anonymous Ratings, Protected by FHE.
          </p>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};
