import { Opportunity, OpportunityCard } from "./OpportunityCard";
import { Search } from "lucide-react";

interface OpportunityListProps {
  opportunities: Opportunity[];
  onDraftReply: (opportunity: Opportunity) => void;
}

export const OpportunityList = ({ opportunities, onDraftReply }: OpportunityListProps) => {
  if (opportunities.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No opportunities yet
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Configure your project above and click "Scan Reddit" to discover high-intent conversations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Opportunities ({opportunities.length})
        </h2>
      </div>
      
      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            onDraftReply={onDraftReply}
          />
        ))}
      </div>
    </div>
  );
};
