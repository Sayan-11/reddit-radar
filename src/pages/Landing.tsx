import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhoItsFor } from "@/components/landing/WhoItsFor";
import { Benefits } from "@/components/landing/Benefits";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

const Landing = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <HowItWorks />
      <WhoItsFor />
      <Benefits />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Landing;
