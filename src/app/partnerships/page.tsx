import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { CorosSection } from "@/components/marketing/partnerships/coros-section";
import { FirstPhormSection } from "@/components/marketing/partnerships/first-phorm-section";
import { PartnerInquiry } from "@/components/marketing/partnerships/partner-inquiry";
import { PartnershipHero } from "@/components/marketing/partnerships/partnership-hero";

export const metadata: Metadata = {
  description:
    "The training, nutrition, and recovery partners behind Threshold Lab, including 1st Phorm and COROS.",
  title: "Partnerships | Threshold Lab",
};

export default function PartnershipsPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      <MarketingHeader />
      <main>
        <PartnershipHero />
        <FirstPhormSection />
        <CorosSection />
        <PartnerInquiry />
      </main>
      <MarketingFooter />
    </div>
  );
}
