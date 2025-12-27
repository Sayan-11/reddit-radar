import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { Opportunity } from "./OpportunityCard";
import { toast } from "@/hooks/use-toast";

interface ReplyModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (intent: string, tone: string) => Promise<string>;
  isGenerating: boolean;
}

const intents = [
  { value: "help-first", label: "Help-first", description: "Safe, helpful response", safe: true },
  { value: "soft-credibility", label: "Soft credibility", description: "Subtle mention of expertise", safe: true },
  { value: "conversion-aware", label: "Conversion-aware", description: "Gentle product mention", safe: false },
];

const tones = [
  { value: "founder", label: "Founder" },
  { value: "engineer", label: "Engineer" },
  { value: "neutral", label: "Neutral user" },
];

export const ReplyModal = ({
  opportunity,
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}: ReplyModalProps) => {
  const [intent, setIntent] = useState("help-first");
  const [tone, setTone] = useState("founder");
  const [generatedReply, setGeneratedReply] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    const reply = await onGenerate(intent, tone);
    setGeneratedReply(reply);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Reply copied successfully. Paste it into Reddit manually.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setGeneratedReply("");
    setIntent("help-first");
    setTone("founder");
    onClose();
  };

  if (!opportunity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Draft Reply</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post preview */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <Badge variant="secondary" className="mb-2">
              r/{opportunity.subreddit}
            </Badge>
            <h3 className="font-semibold text-foreground mb-2">{opportunity.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {opportunity.content}
            </p>
          </div>

          {/* Intent selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Reply Intent</Label>
            <RadioGroup value={intent} onValueChange={setIntent} className="space-y-2">
              {intents.map((i) => (
                <label
                  key={i.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    intent === i.value
                      ? "border-orange bg-orange/5"
                      : "border-border hover:border-orange/50"
                  }`}
                >
                  <RadioGroupItem value={i.value} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{i.label}</span>
                      {!i.safe && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Use carefully
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{i.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Tone selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tone</Label>
            <RadioGroup value={tone} onValueChange={setTone} className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <label
                  key={t.value}
                  className={`px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                    tone === t.value
                      ? "border-orange bg-orange/5"
                      : "border-border hover:border-orange/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={t.value} className="sr-only" />
                    <span className="font-medium text-sm">{t.label}</span>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Generate button */}
          <Button
            variant="hero"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Draft
              </>
            )}
          </Button>

          {/* Generated reply */}
          {generatedReply && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Generated Reply</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              
              <Textarea
                value={generatedReply}
                onChange={(e) => setGeneratedReply(e.target.value)}
                className="min-h-[150px] rounded-xl"
              />

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-800">
                  Manual posting recommended. Avoid links in your first reply to build trust.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
