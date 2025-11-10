import { useState } from "react";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CritiqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    score: number;
    rationale: string;
    confidentialComments: string;
    privateNotes: string;
  }) => void;
  artworkTitle: string;
}

export const CritiqueModal = ({ isOpen, onClose, onSubmit, artworkTitle }: CritiqueModalProps) => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [score, setScore] = useState(7);
  const [rationale, setRationale] = useState("");
  const [confidentialComments, setConfidentialComments] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rationale.trim()) {
      toast({
        title: "Missing rationale",
        description: "Please provide a rationale for your score.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      score,
      rationale,
      confidentialComments,
      privateNotes,
    });

    // Reset form
    setScore(7);
    setRationale("");
    setConfidentialComments("");
    setPrivateNotes("");
    
    toast({
      title: "Critique submitted",
      description: "Your encrypted critique has been submitted successfully.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-lock" />
            Submit Encrypted Critique
          </DialogTitle>
          <DialogDescription>
            Critique "{artworkTitle}" - All fields will be encrypted
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="score">
              Score (1-10) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="score"
              type="number"
              min="1"
              max="10"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="rationale">
              Score Rationale <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Explain your scoring decision..."
              className="mt-1.5 min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="confidential">
              Confidential Comments
              <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <Textarea
              id="confidential"
              value={confidentialComments}
              onChange={(e) => setConfidentialComments(e.target.value)}
              placeholder="Comments that should remain confidential..."
              className="mt-1.5 min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="private">
              Private Notes
              <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <Textarea
              id="private"
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
              placeholder="Your private notes about this artwork..."
              className="mt-1.5 min-h-[80px]"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-crypto-light/10 rounded-lg border border-crypto-accent/20">
            <Lock className="w-4 h-4 text-lock shrink-0" />
            <p className="text-xs text-muted-foreground">
              All critique data will be encrypted and only viewable by authorized curators and the artist.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-crypto">
              <Lock className="w-4 h-4 mr-2" />
              Submit Encrypted Critique
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
