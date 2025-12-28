import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ProjectSetup, ProjectData } from "@/components/dashboard/ProjectSetup";
import { OpportunityList } from "@/components/dashboard/OpportunityList";
import { ReplyModal } from "@/components/dashboard/ReplyModal";
import { Opportunity } from "@/components/dashboard/OpportunityCard";
import { toast } from "@/hooks/use-toast";
import { fetchRedditPosts, RedditPost } from "@/lib/reddit";
import { scorePost } from "@/lib/scoring";
import { generateReply } from "@/lib/openai";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const location = useLocation();
  const initialUrl = location.state?.websiteUrl || "";

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [minScore, setMinScore] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  const filteredOpportunities = opportunities.filter((op) => op.score >= minScore);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleScan = async (data: ProjectData) => {
    setIsScanning(true);
    setOpportunities([]); // Clear previous results

    try {
      // Parse subreddits (comma-separated)
      const subredditList = data.subreddits
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (subredditList.length === 0) {
        toast({
          title: "Error",
          description: "Please enter at least one subreddit.",
          variant: "destructive",
        });
        setIsScanning(false);
        return;
      }

      // Convert timeframe to hours
      const timeframeMap: Record<string, number> = {
        "24h": 24,
        "48h": 48,
        "7d": 168, // 7 days = 168 hours
      };
      const hours = timeframeMap[data.timeframe] || 24;

      // Fetch posts from all subreddits
      const allPosts: RedditPost[] = [];
      for (const subreddit of subredditList) {
        const posts = await fetchRedditPosts(subreddit, hours);
        allPosts.push(...posts);
      }

      // Score each post
      const scoredOpportunities = allPosts.map((post) => {
        const scoringResult = scorePost(post);

        // Calculate post age for display
        const currentTime = Math.floor(Date.now() / 1000);
        const postAgeInSeconds = currentTime - post.created_utc;
        const postAgeInMinutes = Math.floor(postAgeInSeconds / 60);
        const postAgeInHours = Math.floor(postAgeInSeconds / 3600);

        let postAge: string;
        if (postAgeInMinutes < 60) {
          postAge = `${postAgeInMinutes}m ago`;
        } else if (postAgeInHours < 24) {
          postAge = `${postAgeInHours}h ago`;
        } else {
          const postAgeInDays = Math.floor(postAgeInHours / 24);
          postAge = `${postAgeInDays}d ago`;
        }

        // Map to Opportunity type
        const opportunity: Opportunity = {
          id: post.id,
          title: post.title,
          subreddit: post.subreddit,
          score: scoringResult.score,
          postAge,
          commentCount: post.num_comments,
          upvoteVelocity: `${post.ups} upvotes`,
          explanation: scoringResult.explanation,
          content: post.selftext || post.title,
          url: `https://www.reddit.com${post.permalink}`,
        };

        return opportunity;
      });

      // Sort by score (descending)
      const sortedOpportunities = scoredOpportunities.sort((a, b) => b.score - a.score);

      setOpportunities(sortedOpportunities);

      toast({
        title: "Scan complete!",
        description: sortedOpportunities.length > 0
          ? `Found ${sortedOpportunities.length} high-intent opportunities.`
          : "No opportunities found. Try adjusting your search criteria.",
      });
    } catch (error) {
      console.error("Error during scan:", error);
      toast({
        title: "Scan failed",
        description: "An error occurred while scanning Reddit. Please try again.",
        variant: "destructive",
      });
      setOpportunities([]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDraftReply = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsModalOpen(true);
  };

  const handleGenerate = async (intent: string, tone: string): Promise<string> => {
    setIsGenerating(true);

    try {
      if (!selectedOpportunity) {
        throw new Error("No opportunity selected");
      }

      // Call OpenAI to generate reply
      const reply = await generateReply({
        title: selectedOpportunity.title,
        body: selectedOpportunity.content,
        intent: intent as "help-first" | "soft-credibility" | "conversion-aware",
        tone: tone as "founder" | "engineer" | "neutral",
      });

      setIsGenerating(false);
      return reply;
    } catch (error) {
      console.error("Error generating reply:", error);
      setIsGenerating(false);

      // Show error toast
      toast({
        title: "Generation failed",
        description: error instanceof Error
          ? error.message
          : "Failed to generate reply. Please check your API key and try again.",
        variant: "destructive",
      });

      // Return empty string on error
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />

      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <ProjectSetup
            onScan={handleScan}
            isScanning={isScanning}
            initialUrl={initialUrl}
          />

          <div className="space-y-6">
            {opportunities.length > 0 && (
              <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Minimum Opportunity Score: {minScore}</Label>
                  <p className="text-sm text-muted-foreground">
                    Filter results to focus on high-quality opportunities
                  </p>
                </div>
                <div className="w-full sm:w-64 space-y-3">
                  <Slider
                    value={[minScore]}
                    onValueChange={(vals) => setMinScore(vals[0])}
                    max={80}
                    step={20}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-medium px-1">
                    <span>0</span>
                    <span>20</span>
                    <span>40</span>
                    <span>60</span>
                    <span>80</span>
                  </div>
                </div>
              </div>
            )}

            <OpportunityList
              opportunities={filteredOpportunities}
              onDraftReply={handleDraftReply}
            />
          </div>
        </div>
      </main>

      <ReplyModal
        opportunity={selectedOpportunity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default Dashboard;
