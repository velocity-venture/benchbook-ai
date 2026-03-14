import dynamic from "next/dynamic";
import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { Footer } from "@/components/marketing/footer";

const SocialProof = dynamic(
  () => import("@/components/marketing/social-proof").then((m) => m.SocialProof),
  { ssr: true }
);
const InteractiveDemo = dynamic(
  () => import("@/components/marketing/interactive-demo").then((m) => m.InteractiveDemo),
  { ssr: true }
);
const FeaturesGrid = dynamic(
  () => import("@/components/marketing/features-grid").then((m) => m.FeaturesGrid),
  { ssr: true }
);
const HowItWorks = dynamic(
  () => import("@/components/marketing/how-it-works").then((m) => m.HowItWorks),
  { ssr: true }
);
const Pricing = dynamic(
  () => import("@/components/marketing/pricing").then((m) => m.Pricing),
  { ssr: true }
);
const Testimonials = dynamic(
  () => import("@/components/marketing/testimonials").then((m) => m.Testimonials),
  { ssr: true }
);
const FinalCTA = dynamic(
  () => import("@/components/marketing/final-cta").then((m) => m.FinalCTA),
  { ssr: true }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <SocialProof />
      <InteractiveDemo />
      <FeaturesGrid />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
