import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, FileText, Hash, Clock, Loader2 } from "lucide-react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              required
            />
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
          <Label htmlFor="description" className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Product Description
          </Label>
          <Textarea
            id="description"
            placeholder="Briefly describe your product and what problems it solves..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-[100px] rounded-xl resize-none"
            required
          />
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
