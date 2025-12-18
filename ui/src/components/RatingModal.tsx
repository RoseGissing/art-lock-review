import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Star, Lock, Sparkles } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number) => void;
  artworkTitle: string;
  isLoading?: boolean;
}

export const RatingModal = ({ isOpen, onClose, onSubmit, artworkTitle, isLoading }: RatingModalProps) => {
  const [score, setScore] = useState([5]);

  const handleSubmit = () => {
    onSubmit(score[0]);
    setScore([5]);
  };

  const getScoreColor = (value: number) => {
    if (value <= 3) return "text-red-500";
    if (value <= 6) return "text-yellow-500";
    return "text-green-500";
  };

  const getScoreLabel = (value: number) => {
    if (value <= 2) return "Poor";
    if (value <= 4) return "Below Average";
    if (value <= 6) return "Average";
    if (value <= 8) return "Good";
    return "Excellent";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        {/* Decorative background */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-cyan-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <DialogHeader className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-cyan-500" />
            </div>
            <DialogTitle className="text-xl">Rate Artwork</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Submit an anonymous rating for "<span className="font-medium text-foreground">{artworkTitle}</span>"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4 relative">
          {/* Score display */}
          <div className="text-center py-4">
            <div className={`text-6xl font-bold transition-all duration-300 ${getScoreColor(score[0])}`}>
              {score[0]}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {getScoreLabel(score[0])}
            </div>
          </div>

          {/* Star indicators */}
          <div className="flex justify-center gap-1">
            {[...Array(10)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 transition-all duration-200 ${
                  i < score[0] 
                    ? 'fill-yellow-400 text-yellow-400 scale-110' 
                    : 'text-muted-foreground/30'
                }`}
                style={{ transitionDelay: `${i * 30}ms` }}
              />
            ))}
          </div>

          {/* Slider */}
          <div className="space-y-3 px-2">
            <Slider
              value={score}
              onValueChange={setScore}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 (Poor)</span>
              <span>10 (Excellent)</span>
            </div>
          </div>

          {/* Privacy notice */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
            <Lock className="w-4 h-4 text-cyan-500 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your rating is encrypted and anonymous. Only aggregate scores can be revealed.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Encrypting...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Submit Rating
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

