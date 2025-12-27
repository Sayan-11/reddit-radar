import { TrendingUp, Clock, MessageCircle, ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Opportunity {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  postAge: string;
  commentCount: number;
  upvoteVelocity: string;
  explanation: string[];
  content: string;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onDraftReply: (opportunity: Opportunity) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 60) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-orange-100 text-orange-700 border-orange-200";
};

export const OpportunityCard = ({ opportunity, onDraftReply }: OpportunityCardProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-5 md:p-6 transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Score badge */}
        <div className="flex lg:flex-col items-center gap-3 lg:gap-1">
          <div
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold border ${getScoreColor(opportunity.score)}`}
          >
            <span className="text-lg">{opportunity.score}</span>
            <span className="text-[10px] font-normal opacity-70">score</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="rounded-lg font-medium">
              r/{opportunity.subreddit}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {opportunity.postAge}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2">
            {opportunity.title}
          </h3>

          {/* Metrics */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {opportunity.commentCount} comments
            </span>
            <span className="flex items-center gap-1">
              <ArrowUp className="w-4 h-4" />
              {opportunity.upvoteVelocity}
            </span>
          </div>

          {/* Explanation */}
          <div className="bg-secondary/50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-foreground">
              <Sparkles className="w-4 h-4 text-orange" />
              Why this is valuable
            </div>
            <ul className="space-y-1">
              {opportunity.explanation.map((point, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <TrendingUp className="w-3 h-3 mt-1 text-orange shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="default"
            size="default"
            onClick={() => onDraftReply(opportunity)}
          >
            Draft Reply
          </Button>
        </div>
      </div>
    </div>
  );
};
