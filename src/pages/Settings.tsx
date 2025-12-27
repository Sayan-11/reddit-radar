import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ArrowLeft, Save, RotateCcw, MessageSquare, Settings as SettingsIcon, Menu } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Settings = () => {
  const [settings, setSettings] = useState({
    defaultTone: "founder",
    productDescription: "",
    defaultSubreddits: "",
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  const handleReset = () => {
    setSettings({
      defaultTone: "founder",
      productDescription: "",
      defaultSubreddits: "",
    });
    toast({
      title: "Settings reset",
      description: "All settings have been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/50 lg:ml-64">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          {/* Mobile menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <div className="h-full bg-card">
                  <div className="p-6 border-b border-border/50">
                    <Link to="/" className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-orange flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <span className="text-lg font-bold text-foreground">RedditReply</span>
                    </Link>
                  </div>
                  <nav className="p-4">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary/50"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-secondary text-foreground"
                    >
                      Settings
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="hidden lg:flex">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          </div>
          
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </header>

      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-orange" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Project Settings</h2>
                <p className="text-sm text-muted-foreground">Configure your default preferences</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Default Tone */}
              <div className="space-y-2">
                <Label>Default Reply Tone</Label>
                <Select
                  value={settings.defaultTone}
                  onValueChange={(value) => setSettings({ ...settings, defaultTone: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="founder">Founder</SelectItem>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    <SelectItem value="neutral">Neutral user</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This will be pre-selected when drafting replies.
                </p>
              </div>

              {/* Product Description */}
              <div className="space-y-2">
                <Label>Default Product Description</Label>
                <Textarea
                  placeholder="Describe your product for the AI to reference when generating replies..."
                  value={settings.productDescription}
                  onChange={(e) => setSettings({ ...settings, productDescription: e.target.value })}
                  className="min-h-[120px] rounded-xl resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Used to generate more relevant and accurate replies.
                </p>
              </div>

              {/* Default Subreddits */}
              <div className="space-y-2">
                <Label>Default Target Subreddits</Label>
                <Input
                  placeholder="SaaS, startups, entrepreneur, marketing"
                  value={settings.defaultSubreddits}
                  onChange={(e) => setSettings({ ...settings, defaultSubreddits: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated list of subreddits to monitor by default.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                <Button variant="hero" onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4" />
                  Save Settings
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                  Reset All
                </Button>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="mt-8 bg-card rounded-2xl border border-destructive/30 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Reset all project data including scan history and generated replies.
            </p>
            <Button variant="destructive">
              Reset Project Data
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
