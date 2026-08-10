export type PartnerProduct = {
  description: string;
  href: string;
  title: string;
};

export type FeaturedPartnerProduct = PartnerProduct & {
  image: string;
  imageAlt: string;
  stat: string;
};

export const firstPhormUrl = "https://1stphorm.com/?a_aid=pelkofer";

export const firstPhormProducts: readonly PartnerProduct[] = [
  {
    description:
      "Quick carbs before and during hard sessions. A core part of long training days and quality run workouts.",
    href: "https://1stphorm.com/products/ultra-formance/?a_aid=pelkofer",
    title: "Ultra-Formance",
  },
  {
    description:
      "A post-session recovery combination for refueling when training volume and intensity are high.",
    href: "https://1stphorm.com/products/clear-post-workout-stack/?a_aid=pelkofer",
    title: "Clear Post Workout Stack",
  },
  {
    description:
      "Fast carbohydrate replenishment to help accelerate recovery between demanding sessions.",
    href: "https://1stphorm.com/products/ignition?a_aid=pelkofer",
    title: "Ignition",
  },
  {
    description:
      "Fast-digesting protein support after training to help rebuild, recover, and get ready to go again.",
    href: "https://1stphorm.com/products/phormula-1-clear/?a_aid=pelkofer",
    title: "Phormula-1 Clear Whey",
  },
] as const;

export const corosProducts: readonly FeaturedPartnerProduct[] = [
  {
    description:
      "An ultralight AMOLED GPS watch with the training tools, recovery data, and battery life I want for everyday work and race day.",
    href: "https://coros.com/us/buy/pace4?variant=47205352997076",
    image: "/marketing/partners/coros-pace-4-white.png",
    imageAlt: "White COROS PACE 4 GPS sport watch with silicone band",
    stat: "White / Silicone",
    title: "PACE 4",
  },
  {
    description:
      "Comfortable arm-based heart-rate tracking for cleaner data through intervals, hybrid sessions, and longer aerobic work.",
    href: "https://shop.coros.com/products/coros-heart-rate-monitor",
    image: "/marketing/partners/coros-heart-rate-monitor.png",
    imageAlt: "White COROS arm-based Heart Rate Monitor",
    stat: "38 hours of activity",
    title: "Heart Rate Monitor",
  },
] as const;
