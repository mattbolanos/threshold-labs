import type { Metadata } from "next";
import { Suspense } from "react";
import { LabHistorySection } from "@/components/marketing/lab-history-section";
import { LabMembershipPitch } from "@/components/marketing/lab-membership-pitch";
import { LabPreviewSection } from "@/components/marketing/lab-preview-section";
import { LabPricingDetails } from "@/components/marketing/lab-pricing-details";
import { LabValueSection } from "@/components/marketing/lab-value-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingHeaderFallback } from "@/components/marketing/marketing-header-fallback";
import { insideLabMembership } from "@/lib/billing";

export const metadata: Metadata = {
  description: `Follow Stephen Pelkofer’s HYROX training, race decisions, and Lab Notes. See a sample training week and join Inside the Lab for ${insideLabMembership.priceLabel}.`,
  title: "Inside the Lab | Stephen Pelkofer’s Training & Analysis",
};

export default function InsideTheLabPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Suspense fallback={<MarketingHeaderFallback />}>
        <MarketingHeader />
      </Suspense>
      <LabMembershipPitch />
      <LabHistorySection />
      <LabValueSection />
      <LabPreviewSection salesPage />
      <LabPricingDetails />
      <MarketingFooter />
    </div>
  );
}
