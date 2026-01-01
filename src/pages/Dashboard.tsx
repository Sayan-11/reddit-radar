import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ProjectSetup, ProjectData } from "@/components/dashboard/ProjectSetup";
import { OpportunityList } from "@/components/dashboard/OpportunityList";
import { ReplyModal, GroundingType, GenerationStep } from "@/components/dashboard/ReplyModal";
import { Opportunity } from "@/components/dashboard/OpportunityCard";
import { toast } from "@/hooks/use-toast";
import { fetchRedditPosts, RedditPost, SubredditContext } from "@/lib/reddit";
import { fetchSubredditComments } from "@/lib/subredditComments";
import { scorePost } from "@/lib/scoring";
import { generateReply } from "@/lib/openai";


const Dashboard = () => {
  const location = useLocation();
  const initialUrl = location.state?.websiteUrl || "";

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [minScore, setMinScore] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  const filteredOpportunities = opportunities.filter((op) => op.score >= minScore);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generationStep, setGenerationStep] = useState<GenerationStep>("idle");
  const [timeframeHours, setTimeframeHours] = useState(24); // Store timeframe for comment fetching

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
      setTimeframeHours(hours);

      // Fetch posts from all subreddits
      const allPosts: RedditPost[] = [];
      const contexts: Record<string, SubredditContext> = {};
      for (const subreddit of subredditList) {
        const result = await fetchRedditPosts(subreddit, hours);
        allPosts.push(...result.posts);
        if (result.subredditContext) {
          contexts[result.subredditContext.subreddit] = result.subredditContext;
        }
      }

      // Parse keywords from description field
      const keywords = data.description
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      // Score each post
      const scoredOpportunities = allPosts.map((post) => {
        const scoringResult = scorePost(post, keywords, contexts[post.subreddit]);

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

  const handleGenerate = async (
    intent: string,
    instructions: string,
    persona: string,
    length: string
  ): Promise<{ reply: string; groundingType: GroundingType }> => {
    setGenerationStep("fetching");

    try {
      if (!selectedOpportunity) {
        throw new Error("No opportunity selected");
      }

      // 1. Fetch subreddit comments for grounding
      let styleExamples: string[] = [];
      let groundingType: GroundingType = "fallback";

      try {
        styleExamples = await fetchSubredditComments(selectedOpportunity.subreddit, timeframeHours);
        if (styleExamples.length > 0) {
          groundingType = "subreddit";
        } else {
          // Fallback if no comments at all
          styleExamples = [];
          groundingType = "fallback";
        }
      } catch (e) {
        console.error("Error fetching subreddit comments:", e);
        // Fallback silently
        groundingType = "fallback";
      }

      setGenerationStep("drafting");

      // 2. Call OpenAI to generate reply
      const reply = await generateReply({
        title: selectedOpportunity.title,
        body: selectedOpportunity.content,
        intent: intent as "help-first" | "soft-credibility" | "conversion-aware",
        persona: persona as any,
        length: length as any,
        instructions,
        styleExamples,
      });

      setGenerationStep("idle");
      return { reply, groundingType };
    } catch (error) {
      console.error("Error generating reply:", error);
      setGenerationStep("idle");

      // Show error toast
      toast({
        title: "Generation failed",
        description: error instanceof Error
          ? error.message
          : "Failed to generate reply. Please check your API key and try again.",
        variant: "destructive",
      });

      throw error;
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
            <OpportunityList
              opportunities={filteredOpportunities}
              onDraftReply={handleDraftReply}
              minScore={minScore}
              onMinScoreChange={setMinScore}
              totalCount={opportunities.length}
            />
          </div>
        </div>
      </main>

      <ReplyModal
        opportunity={selectedOpportunity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerate}
        generationStep={generationStep}
      />
    </div>
  );
};

export default Dashboard;
