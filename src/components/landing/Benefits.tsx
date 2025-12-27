import { Shield, Zap, Heart } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Avoid Getting Banned",
    description:
      "Our reply generator is designed to sound human and helpful, not promotional. Stay safe while building your presence.",
  },
  {
    icon: Zap,
    title: "Catch Buying Intent Early",
    description:
      "Get notified about relevant posts before they blow up. Be first to help when someone is actively looking for solutions.",
  },
  {
    icon: Heart,
    title: "Sound Helpful, Not Promotional",
    description:
      "AI-crafted replies focus on genuinely helping the poster first. Build trust and credibility naturally.",
  },
];

export const Benefits = () => {
  return (
    <section className="py-20 md:py-32 bg-card">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Reddit Marketing Fails (And How We Fix It)
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Most founders get banned or ignored. Here's how we help you succeed.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-6 flex items-center justify-center transition-all duration-300 group-hover:bg-orange group-hover:scale-110">
                <benefit.icon className="w-8 h-8 text-orange transition-colors group-hover:text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
