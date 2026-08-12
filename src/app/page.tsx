import type { Metadata } from "next";
import { Suspense } from "react";
import { FounderSection } from "@/components/marketing/founder-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingHeaderFallback } from "@/components/marketing/marketing-header-fallback";
import { OffersSection } from "@/components/marketing/offers-section";
import { PartnershipsStrip } from "@/components/marketing/partnerships-strip";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";

export const metadata: Metadata = {
  description:
    "A year-round training system and HYROX community for every kind of athlete.",
  title: "Threshold Lab | Train Year-Round",
};

export const prefetch = "partial";

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      <Suspense fallback={<MarketingHeaderFallback />}>
        <MarketingHeader />
      </Suspense>
      <main>
        <HeroSection />
        <OffersSection />
        <FounderSection />
        <TestimonialsSection />
        <PartnershipsStrip />
      </main>
      <MarketingFooter />
    </div>
  );
}
