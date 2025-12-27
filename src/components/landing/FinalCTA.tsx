import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-32 gradient-warm relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber/30 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 rounded-3xl bg-card shadow-card mx-auto mb-8 flex items-center justify-center">
            <Rocket className="w-10 h-10 text-orange" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Find Your Next Customers on Reddit?
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            No credit card required. Start discovering high-intent conversations in minutes.
          </p>
          
          <Button
            variant="hero"
            size="xl"
            onClick={() => navigate("/dashboard")}
            className="group"
          >
            Try the Dashboard
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Manual posting only. No auto-posting or spam tools.
          </p>
        </div>
      </div>
    </section>
  );
};
