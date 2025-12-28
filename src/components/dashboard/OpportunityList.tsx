import { Opportunity, OpportunityCard } from "./OpportunityCard";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OpportunityListProps {
  opportunities: Opportunity[];
  onDraftReply: (opportunity: Opportunity) => void;
  minScore: number;
  onMinScoreChange: (score: number) => void;
  totalCount: number;
}

export const OpportunityList = ({
  opportunities,
  onDraftReply,
  minScore,
  onMinScoreChange,
  totalCount,
}: OpportunityListProps) => {
  if (totalCount === 0) {
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Min Score:
          </span>
          <Select
            value={minScore.toString()}
            onValueChange={(val) => onMinScoreChange(Number(val))}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0-20</SelectItem>
              <SelectItem value="20">20-40</SelectItem>
              <SelectItem value="40">40-60</SelectItem>
              <SelectItem value="60">60-80</SelectItem>
              <SelectItem value="80">80-100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50 border-dashed">
          No opportunities match the selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onDraftReply={onDraftReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};
