import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Copy, Check, Loader2, AlertTriangle, Sparkles, Info } from "lucide-react";
import { Opportunity } from "./OpportunityCard";
import { toast } from "@/hooks/use-toast";

export type GroundingType = "subreddit" | "fallback" | null;
export type GenerationStep = "idle" | "fetching" | "drafting";

interface ReplyModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (intent: string, instructions: string) => Promise<{ reply: string; groundingType: GroundingType }>;
  generationStep: GenerationStep;
}

const intents = [
  { value: "help-first", label: "Help-first", description: "Safe, helpful response", safe: true },
  { value: "soft-credibility", label: "Soft credibility", description: "Subtle mention of expertise", safe: true },
  { value: "conversion-aware", label: "Conversion-aware", description: "Gentle product mention", safe: false },
];

export const ReplyModal = ({
  opportunity,
  isOpen,
  onClose,
  onGenerate,
  generationStep,
}: ReplyModalProps) => {
  const [intent, setIntent] = useState("help-first");
  const [instructions, setInstructions] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [groundingType, setGroundingType] = useState<GroundingType>(null);
  const [copied, setCopied] = useState(false);

  const isGenerating = generationStep !== "idle";

  const handleGenerate = async () => {
    setGeneratedReply("");
    setGroundingType(null);
    try {
      const result = await onGenerate(intent, instructions);
      setGeneratedReply(result.reply);
      setGroundingType(result.groundingType);
    } catch (error) {
      // Error handling is done in parent
    }
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
    setInstructions("");
    setGroundingType(null);
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
            <Label className="text-base font-medium">Comment objective</Label>
            <Select value={intent} onValueChange={setIntent}>
              <SelectTrigger className="w-full h-auto py-3">
                <SelectValue placeholder="Select objective" />
              </SelectTrigger>
              <SelectContent>
                {intents.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    <div className="flex flex-col items-start text-left gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{i.label}</span>
                        {!i.safe && (
                          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px] px-1.5 py-0 h-5">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Use carefully
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{i.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instructions (optional) */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Specific instructions (optional)</Label>
            <Textarea
              placeholder="e.g. Avoid mentioning paid resources, keep it short and conversational..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-[80px] rounded-xl"
            />
          </div>

          {/* Tone Info Alert */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-800">
              Tone is automatically matched to how people typically write in this subreddit, based on recent high-engagement comments. This helps your reply blend in naturally.
            </p>
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
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {generationStep === "fetching"
                  ? "Reading the room..."
                  : "Drafting reply..."}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Draft
              </>
            )}
          </Button>

          {/* Generated reply */}
          {generatedReply && (
            <div className="space-y-3 animate-fade-in">
              {/* Grounding Feedback Banner - Removed as per user request */}

              {groundingType === "fallback" && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">
                    Not enough recent comments were available to infer subreddit tone. This draft uses a general Reddit-safe style.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <Label className="text-base font-medium">Generated Reply</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
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


            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
