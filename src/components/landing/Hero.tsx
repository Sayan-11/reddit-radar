import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";

const trustLogos = [
  "TechCrunch",
  "ProductHunt",
  "YCombinator",
  "Indie Hackers",
  "Hacker News",
];

export const Hero = () => {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleGetReport = () => {
    navigate("/dashboard", { state: { websiteUrl: url } });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-peach/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 mb-8 shadow-soft animate-fade-in">
            <Sparkles className="w-4 h-4 text-orange" />
            <span className="text-sm font-medium text-foreground">
              AI-Powered Reddit Discovery
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Find High-Intent Reddit Conversations{" "}
            <span className="text-orange">Before They Explode</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Discover the right threads, understand why they matter, and reply
            like a human — not a marketer.
          </p>

          {/* CTA Form */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Input
              type="url"
              placeholder="Enter your website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 h-14 text-base bg-card/90 backdrop-blur-sm shadow-soft"
            />
            <Button
              variant="hero"
              size="xl"
              onClick={handleGetReport}
              className="group"
            >
              Get Free Report
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Trust Row */}
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by founders featured on
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {trustLogos.map((logo) => (
                <div
                  key={logo}
                  className="text-muted-foreground/60 font-semibold text-sm md:text-base"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
