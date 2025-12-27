import { Link2, Search, Eye, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Add Your Product",
    description: "Enter your website and target subreddits to start monitoring.",
  },
  {
    icon: Search,
    title: "We Scan & Rank",
    description: "Our AI scans Reddit and ranks posts by buying intent and opportunity.",
  },
  {
    icon: Eye,
    title: "See Why It Matters",
    description: "Understand exactly why each post is valuable with clear explanations.",
  },
  {
    icon: MessageSquare,
    title: "Draft Safe Replies",
    description: "Generate human-sounding replies that won't get you banned.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 md:py-32 bg-card">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to find and engage with high-intent Reddit conversations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              <div className="relative bg-background rounded-2xl p-6 shadow-soft border border-border/50 transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-orange text-accent-foreground text-sm font-bold flex items-center justify-center shadow-soft">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-orange" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
