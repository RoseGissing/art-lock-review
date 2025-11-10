import { Star, Shield } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        {/* Star with shield background */}
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield background */}
          <path
            d="M20 4L8 8L8 18C8 25 12 30 20 36C28 30 32 25 32 18L32 8L20 4Z"
            fill="hsl(var(--primary))"
            opacity="0.2"
          />
          {/* Star */}
          <path
            d="M20 8L22 14L28 14L23 18L25 24L20 20L15 24L17 18L12 14L18 14L20 8Z"
            fill="hsl(var(--primary))"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold leading-none">ArtRating</span>
        <span className="text-xs text-muted-foreground leading-none">Anonymous Scoring</span>
      </div>
    </div>
  );
};
