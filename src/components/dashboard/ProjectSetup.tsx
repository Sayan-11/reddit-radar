import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, FileText, Hash, Clock, Loader2, Info, Sparkles } from "lucide-react";
import { suggestKeywordsFromUrl } from "@/lib/keywordExtractor";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectSetupProps {
  onScan: (data: ProjectData) => void;
  isScanning: boolean;
  initialUrl?: string;
}

export interface ProjectData {
  websiteUrl: string;
  description: string;
  subreddits: string;
  timeframe: string;
}

export const ProjectSetup = ({ onScan, isScanning, initialUrl = "" }: ProjectSetupProps) => {
  const [formData, setFormData] = useState<ProjectData>({
    websiteUrl: initialUrl,
    description: "",
    subreddits: "",
    timeframe: "24h",
  });
  const [urlError, setUrlError] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState(false);

  const handleSuggestKeywords = async () => {
    if (!formData.websiteUrl || isSuggesting) return;

    setIsSuggesting(true);
    setSuggestionError(false);

    try {
      // Ensure URL has protocol
      let url = formData.websiteUrl;
      if (!url.startsWith("http")) {
        url = "https://" + url;
      }

      const suggested = await suggestKeywordsFromUrl(url);

      if (suggested.length > 0) {
        const currentKeywords = formData.description.trim();
        const newKeywords = suggested.join(", ");

        setFormData(prev => ({
          ...prev,
          description: currentKeywords
            ? `${currentKeywords}, ${newKeywords}`
            : newKeywords
        }));
      } else {
        setSuggestionError(true);
      }
    } catch (error) {
      console.error("Suggestion error:", error);
      setSuggestionError(true);
    } finally {
      setIsSuggesting(false);
    }
  };

  const validateUrl = (url: string) => {
    if (!url) {
      setUrlError("");
      return;
    }
    try {
      // Basic URL validation
      const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

      if (pattern.test(url)) {
        setUrlError("");
      } else {
        setUrlError("Please enter a valid URL");
      }
    } catch (e) {
      setUrlError("Please enter a valid URL");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlError) return;
    onScan(formData);
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Globe className="w-5 h-5 text-orange" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Project Setup</h2>
          <p className="text-sm text-muted-foreground">Configure your Reddit monitoring</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://yourproduct.com"
              value={formData.websiteUrl}
              onChange={(e) => {
                setFormData({ ...formData, websiteUrl: e.target.value });
                if (urlError) validateUrl(e.target.value);
              }}
              onBlur={(e) => validateUrl(e.target.value)}
              className={urlError ? "border-destructive focus-visible:ring-destructive" : ""}
              required
            />
            {urlError && (
              <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1">
                {urlError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subreddits" className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              Target Subreddits
            </Label>
            <Input
              id="subreddits"
              placeholder="SaaS, startups, entrepreneur"
              value={formData.subreddits}
              onChange={(e) => setFormData({ ...formData, subreddits: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="description" className="flex items-center gap-2 cursor-help w-fit">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Target Keywords
                  <Info className="w-3.5 h-3.5 text-muted-foreground/70" />
                </Label>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>This is important to filter the relevant Reddit posts</p>
              </TooltipContent>
            </Tooltip>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[10px] px-2 border-border/50 hover:bg-secondary/50"
              onClick={handleSuggestKeywords}
              disabled={isSuggesting || !formData.websiteUrl || !!urlError}
            >
              {isSuggesting ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Sparkles className="w-3 h-3 mr-1 text-orange" />
              )}
              Suggest from website
            </Button>
          </div>
          <Textarea
            id="description"
            placeholder="e.g. tool, alternative, recommend, saas"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              setSuggestionError(false);
            }}
            className="min-h-[100px] rounded-xl resize-none"
            required
          />
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">
              We’ll try to pull commonly used keywords from your website. You can edit or remove anything.
            </p>
            {suggestionError && (
              <p className="text-[10px] text-amber-600 animate-in fade-in slide-in-from-top-1">
                We couldn’t find usable keywords on this website. You can enter keywords manually.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
          <div className="space-y-2 w-full sm:w-48">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Timeframe
            </Label>
            <Select
              value={formData.timeframe}
              onValueChange={(value) => setFormData({ ...formData, timeframe: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="48h">Last 48 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" variant="hero" size="lg" disabled={isScanning}>
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              "Scan Reddit"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
