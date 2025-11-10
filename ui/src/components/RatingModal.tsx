import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate Artwork</DialogTitle>
          <DialogDescription>
            Submit an anonymous rating (1-10) for "{artworkTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Score: {score[0]}/10</Label>
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

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

