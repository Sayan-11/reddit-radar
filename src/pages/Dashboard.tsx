import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ProjectSetup, ProjectData } from "@/components/dashboard/ProjectSetup";
import { OpportunityList } from "@/components/dashboard/OpportunityList";
import { ReplyModal } from "@/components/dashboard/ReplyModal";
import { Opportunity } from "@/components/dashboard/OpportunityCard";
import { mockOpportunities } from "@/data/mockOpportunities";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const location = useLocation();
  const initialUrl = location.state?.websiteUrl || "";

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleScan = async (data: ProjectData) => {
    setIsScanning(true);
    
    // Simulate scanning delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setOpportunities(mockOpportunities);
    setIsScanning(false);
    
    toast({
      title: "Scan complete!",
      description: `Found ${mockOpportunities.length} high-intent opportunities.`,
    });
  };

  const handleDraftReply = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsModalOpen(true);
  };

  const handleGenerate = async (intent: string, tone: string): Promise<string> => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mock generated reply based on intent and tone
    const replies: Record<string, string> = {
      "help-first": `Hey! I've been through this exact situation. What worked for me was focusing on genuinely helping people first - answering their questions thoroughly without any agenda. It builds trust and people naturally become curious about what you're working on.\n\nA few things that helped:\n1. Set up keyword alerts for relevant terms\n2. Focus on threads where you can add real value\n3. Share your experience, not your product\n\nHappy to chat more if you have questions!`,
      "soft-credibility": `Great question! I've spent the last few months figuring this out for my own project. The key insight for me was that Reddit rewards authenticity over promotion.\n\nWhat's worked:\n- Being genuinely helpful first (sounds obvious but most people skip this)\n- Building karma in relevant communities before mentioning anything\n- Sharing lessons learned from building, not features\n\nI built a small tool to help track relevant conversations, and it's been a game-changer. Let me know if you want me to share more about the approach!`,
      "conversion-aware": `I feel your pain - went through this exact challenge. After lots of trial and error, I found that the key is timing and relevance.\n\nHere's what I learned:\n1. Find conversations where your solution is genuinely needed\n2. Lead with value - answer the question thoroughly\n3. Mention your product only if it's truly relevant\n\nActually built something to help with this - it scans for high-intent posts and helps craft appropriate responses. Happy to share more if interested!`,
    };

    const toneAdjustments: Record<string, string> = {
      founder: "\n\nBuilding in public, so always happy to share what I'm learning. DM me if you want to chat more!",
      engineer: "\n\nI can share the technical approach if you're interested in the implementation details.",
      neutral: "",
    };

    const reply = (replies[intent] || replies["help-first"]) + (toneAdjustments[tone] || "");
    
    setIsGenerating(false);
    return reply;
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
          
          <OpportunityList
            opportunities={opportunities}
            onDraftReply={handleDraftReply}
          />
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
