import { CheckCircle2, XCircle } from "lucide-react";

export const WhoItsFor = () => {
  return (
    <section className="py-20 md:py-32 gradient-warm">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Who It's For
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for founders who want to grow authentically on Reddit
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* For card */}
          <div className="bg-card rounded-3xl p-8 shadow-card border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Founders & Marketers Who've Tried Reddit Before
            </h3>
            <ul className="space-y-3">
              {[
                "Want to reach engaged communities authentically",
                "Tired of guessing which posts to reply to",
                "Looking for buying signals before competition",
                "Need help writing non-promotional replies",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not for card */}
          <div className="bg-card rounded-3xl p-8 shadow-card border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-6">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Not For Spam, Bots, or Auto-Posting
            </h3>
            <ul className="space-y-3">
              {[
                "Automated posting or mass messaging",
                "Spammy link dropping strategies",
                "Bot accounts or fake personas",
                "Violating Reddit's terms of service",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
