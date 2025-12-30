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
import { Copy, Check, Loader2, AlertTriangle, Sparkles, Info, MessageSquare, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Opportunity } from "./OpportunityCard";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type GroundingType = "subreddit" | "fallback" | null;
export type GenerationStep = "idle" | "fetching" | "drafting";

interface ReplyModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (intent: string, instructions: string, persona: string, length: string) => Promise<{ reply: string; groundingType: GroundingType }>;
  generationStep: GenerationStep;
}

const intents = [
  { value: "help-first", label: "Help-first", description: "Safe, helpful response", safe: true },
  { value: "soft-credibility", label: "Soft credibility", description: "Subtle mention of expertise", safe: true },
  { value: "conversion-aware", label: "Conversion-aware", description: "Gentle product mention", safe: false },
];

const personas = [
  { value: "neutral-peer", label: "Neutral Peer", description: "Sounds like a regular Redditor sharing personal experience. Safest option." },
  { value: "experienced-practitioner", label: "Experienced Practitioner", description: "Shares advice based on firsthand experience without sounding authoritative." },
  { value: "curious-collaborator", label: "Curious Collaborator", description: "Asks thoughtful questions and adds light guidance to move the discussion forward." },
  { value: "builder-indie-hacker", label: "Builder / Indie Hacker", description: "Frames insights from a builder’s perspective. Subtle and transparent." },
  { value: "light-authority", label: "Light Authority", description: "Confident and precise, without credentials or overt authority claims." },
];

const lengths = [
  { value: "short", label: "Short", description: "Quick, concise response" },
  { value: "medium", label: "Medium", description: "Balanced and conversational" },
  { value: "long", label: "Long", description: "Detailed and thorough" },
];

export const ReplyModal = ({
  opportunity,
  isOpen,
  onClose,
  onGenerate,
  generationStep,
}: ReplyModalProps) => {
  const [intent, setIntent] = useState("help-first");
  const [persona, setPersona] = useState("neutral-peer");
  const [length, setLength] = useState("medium");
  const [instructions, setInstructions] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [groundingType, setGroundingType] = useState<GroundingType>(null);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isGenerating = generationStep !== "idle";

  const handleGenerate = async () => {
    setGeneratedReply("");
    setGroundingType(null);
    try {
      const result = await onGenerate(intent, instructions, persona, length);
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
    setPersona("neutral-peer");
    setLength("medium");
    setInstructions("");
    setGroundingType(null);
    setIsExpanded(false);
    onClose();
  };

  if (!opportunity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden border-none bg-background shadow-2xl">
        <div className="flex flex-col md:flex-row h-[750px]">
          {/* Left Panel: Controls */}
          <div className="w-full md:w-[420px] flex flex-col border-r bg-muted/5">
            <div className="p-8 border-b bg-background">
              <DialogHeader className="mb-0">
                <DialogTitle className="text-xl font-bold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  Drafting Workspace
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Post Context */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-background text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                    r/{opportunity.subreddit}
                  </Badge>
                  <a
                    href={opportunity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 transition-colors"
                  >
                    View full post
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-base text-foreground leading-tight">
                    {opportunity.title}
                  </h3>
                  <div className="relative">
                    <p className={cn(
                      "text-sm text-muted-foreground leading-relaxed transition-all duration-300",
                      !isExpanded && "line-clamp-3"
                    )}>
                      {opportunity.content}
                    </p>
                    {opportunity.content.length > 150 && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs font-semibold text-primary mt-2 flex items-center gap-1 hover:opacity-80 transition-opacity"
                      >
                        {isExpanded ? (
                          <>Show less <ChevronUp className="w-3 h-3" /></>
                        ) : (
                          <>Read more <ChevronDown className="w-3 h-3" /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/40" />

              {/* Comment Objective */}
              <div className="space-y-4">
                <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                  Comment Objective
                  <span className="text-destructive/80">*</span>
                </Label>
                <Select
                  value={intent}
                  onValueChange={setIntent}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="w-full bg-background border-border/60 h-auto py-3 px-4 rounded-2xl [&>span]:line-clamp-none">
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    {intents.map((i) => (
                      <SelectItem key={i.value} value={i.value} className="py-3">
                        <div className="flex flex-col items-start text-left gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{i.label}</span>
                            {!i.safe && (
                              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-[9px] px-1.5 py-0 h-4 font-bold uppercase">
                                Use carefully
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground font-medium">{i.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Persona Selector */}
              <div className="space-y-4">
                <Label className="text-sm font-bold text-foreground">
                  Persona
                </Label>
                <Select
                  value={persona}
                  onValueChange={setPersona}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="w-full bg-background border-border/60 h-auto py-3 px-4 rounded-2xl [&>span]:line-clamp-none">
                    <SelectValue placeholder="Select persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {personas.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="py-3">
                        <div className="flex flex-col items-start text-left gap-1">
                          <span className="font-bold text-sm">{p.label}</span>
                          <span className="text-[11px] text-muted-foreground font-medium">{p.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reply Length Selector */}
              <div className="space-y-4">
                <Label className="text-sm font-bold text-foreground">
                  Reply length
                </Label>
                <Select
                  value={length}
                  onValueChange={setLength}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="w-full bg-background border-border/60 h-auto py-3 px-4 rounded-2xl [&>span]:line-clamp-none">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    {lengths.map((l) => (
                      <SelectItem key={l.value} value={l.value} className="py-3">
                        <div className="flex flex-col items-start text-left gap-1">
                          <span className="font-bold text-sm">{l.label}</span>
                          <span className="text-[11px] text-muted-foreground font-medium">{l.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <Label className="text-sm font-bold text-foreground">
                  Specific Instructions
                </Label>
                <Textarea
                  placeholder="e.g. Avoid mentioning paid resources, keep it short and conversational..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  disabled={isGenerating}
                  className="min-h-[120px] bg-background border-border/60 resize-none text-sm focus-visible:ring-primary/20 p-4 leading-relaxed rounded-2xl"
                />
              </div>

              {/* Tone Info Alert */}
              <div className="bg-blue-50/40 border border-blue-100/60 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[11px] leading-relaxed text-blue-900/80 font-medium">
                  Tone is automatically matched to how people typically write in this subreddit, based on recent high-engagement comments. This helps your reply blend in naturally.
                </p>
              </div>
            </div>

            <div className="p-8 border-t bg-background mt-auto">
              <Button
                variant="hero"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full shadow-xl shadow-primary/10 h-12 text-base font-bold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {generationStep === "fetching" ? "Reading the room..." : "Drafting reply..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Draft
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Panel: Output */}
          <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8 animate-in fade-in duration-700">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/15 blur-3xl rounded-full animate-pulse" />
                  <div className="relative w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center border border-primary/10 shadow-inner">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-bold text-foreground tracking-tight">
                    {generationStep === "fetching" ? "Reading the room..." : "Drafting your reply..."}
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-[320px] mx-auto leading-relaxed">
                    Analyzing subreddit patterns and crafting a response that feels native to the community.
                  </p>
                </div>
              </div>
            ) : generatedReply ? (
              <div className="flex-1 flex flex-col h-full animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center justify-between px-10 py-6 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                  <div className="flex flex-col gap-1">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      Generated Result
                    </Label>
                    <span className="text-xs text-muted-foreground font-medium">Review and refine your draft</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-10 px-5 gap-2 border-border/60 hover:bg-secondary hover:text-foreground transition-all font-bold rounded-xl"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Draft</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="max-w-3xl mx-auto px-10 py-12 space-y-8">
                    {groundingType === "fallback" && (
                      <div className="bg-amber-50/60 border border-amber-100/80 rounded-2xl p-5 flex items-start gap-4 animate-in slide-in-from-top-2 duration-500">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-amber-900">Style Fallback Active</p>
                          <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                            Not enough recent comments were available to infer subreddit tone. This draft uses a general Reddit-safe style.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="relative min-h-[400px]">
                      <Textarea
                        value={generatedReply}
                        onChange={(e) => setGeneratedReply(e.target.value)}
                        className="min-h-[500px] w-full resize-none bg-transparent border-none focus-visible:ring-0 p-0 text-lg leading-[1.8] text-foreground placeholder:text-muted-foreground/20 font-medium selection:bg-primary/10"
                        placeholder="Your draft will appear here..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8 text-muted-foreground">
                <div className="w-24 h-24 rounded-[2rem] bg-muted/20 flex items-center justify-center border border-dashed border-border/60 group hover:border-primary/30 transition-colors">
                  <Sparkles className="w-12 h-12 text-muted-foreground/20 group-hover:text-primary/20 transition-colors" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-bold text-foreground tracking-tight">Your draft will appear here</h4>
                  <p className="text-sm max-w-[300px] mx-auto leading-relaxed font-medium">
                    Configure your objective on the left and click generate to start drafting your response.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
