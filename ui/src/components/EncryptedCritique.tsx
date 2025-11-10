import { Critique } from "@/types/artwork";
import { Lock, Unlock, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface EncryptedCritiqueProps {
  critique: Critique;
  isAuthorized: boolean;
  onDecrypt: () => void;
}

export const EncryptedCritique = ({ critique, isAuthorized, onDecrypt }: EncryptedCritiqueProps) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!critique.isDecrypted) {
    return (
      <Card className="p-3 bg-crypto-light/10 border-crypto-accent/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1">
            <div className="mt-0.5 p-1.5 rounded-full bg-lock/10">
              <Lock className="w-3.5 h-3.5 text-lock" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground/80">
                {formatAddress(critique.criticAddress)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(critique.timestamp)}
              </p>
              <p className="text-xs text-lock mt-1 italic">
                Encrypted critique - requires authorization to view
              </p>
            </div>
          </div>
          
          {isAuthorized && (
            <Button
              onClick={onDecrypt}
              size="sm"
              variant="outline"
              className="shrink-0 border-crypto-accent text-crypto-accent hover:bg-crypto-accent/10"
            >
              <Unlock className="w-3 h-3 mr-1" />
              Decrypt
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 bg-card border-border/50">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2 flex-1">
          <div className="mt-0.5 p-1.5 rounded-full bg-accent/10">
            <Unlock className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground/80">
              {formatAddress(critique.criticAddress)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(critique.timestamp)}
            </p>
          </div>
        </div>
        
        {critique.decryptedContent && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10">
            <Star className="w-3 h-3 text-accent fill-accent" />
            <span className="text-xs font-semibold text-accent">
              {critique.decryptedContent.score}/10
            </span>
          </div>
        )}
      </div>

      {critique.decryptedContent && (
        <div className="space-y-2 text-xs">
          <div>
            <p className="font-medium text-foreground/70 mb-0.5">Rationale:</p>
            <p className="text-foreground/90">{critique.decryptedContent.rationale}</p>
          </div>
          
          {critique.decryptedContent.confidentialComments && (
            <div>
              <p className="font-medium text-foreground/70 mb-0.5">Confidential Comments:</p>
              <p className="text-foreground/90">{critique.decryptedContent.confidentialComments}</p>
            </div>
          )}
          
          {critique.decryptedContent.privateNotes && (
            <div>
              <p className="font-medium text-foreground/70 mb-0.5">Private Notes:</p>
              <p className="text-foreground/90 italic">{critique.decryptedContent.privateNotes}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
