import { IconArrowUpRight, IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import { insideLabMembership } from "@/lib/billing";
import { appMembership, appMembershipUrl } from "@/lib/marketing-content";
import { MarketingContainer } from "./marketing-container";

const memberships = [
  {
    cta: "Join the app membership",
    description:
      "Show up knowing what to do. Structured HYROX, running, and off-season programs, with a community training alongside you.",
    eyebrow: "A plan for your training",
    features: [
      "8+ structured training programs",
      "Community forum",
      "Monthly office hours with Q&A",
    ],
    fit: "For athletes who want structure and a plan to follow.",
    href: appMembershipUrl,
    id: "app-membership",
    number: "01",
    platform: "Training delivered through Everfit",
    price: appMembership.price,
    title: "Threshold Lab App",
  },
  {
    cta: "Explore Inside the Lab",
    description:
      "Follow my pursuit of the highest level of HYROX. See the sessions, data, race strategy, and thinking behind the work.",
    eyebrow: "A window into my training",
    features: [
      "My training from 30 days before you join onward",
      "Race schedule, strategy, and recaps",
      "Every Lab Note, past and future",
    ],
    fit: "For athletes and coaches who want to study the process.",
    href: "/inside-the-lab",
    id: "inside-the-lab",
    number: "02",
    platform: "Training log and analysis on this site",
    price: insideLabMembership.price,
    title: "Inside the Lab",
  },
] as const;

const ctaClass =
  "mt-auto flex items-center justify-between gap-3 rounded-xl bg-primary px-5 py-4 text-sm font-bold text-neutral-950 transition hover:brightness-110";

export function OffersSection() {
  return (
    <section className="scroll-mt-24" id="work-with-me">
      <MarketingContainer className="route-padding-x py-16 sm:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-lg text-3xl font-black tracking-tight text-white sm:text-4xl">
            Choose what you came to build.
          </h2>
          <p className="max-w-sm text-sm leading-6 text-neutral-400">
            The app helps you follow a program. Inside the Lab lets you follow
            the athlete behind it.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {memberships.map((product) => (
            <article
              className="flex scroll-mt-24 flex-col rounded-3xl border border-primary/20 bg-neutral-900/60 p-6 sm:p-8"
              id={product.id}
              key={product.id}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold tracking-widest text-primary uppercase">
                  {product.eyebrow}
                </p>
                <span className="font-mono text-sm text-neutral-500">
                  {product.number}
                </span>
              </div>
              <h3 className="mt-6 text-3xl font-black tracking-tight text-white">
                {product.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-neutral-400">
                {product.description}
              </p>
              <p className="mt-6 text-4xl font-black text-white">
                ${product.price}
                <span className="text-sm font-normal text-neutral-400">
                  {" "}
                  / month
                </span>
              </p>
              <ul className="my-6 space-y-3 border-t border-white/10 pt-6">
                {product.features.map((feature) => (
                  <li
                    className="flex gap-2 text-sm text-neutral-300"
                    key={feature}
                  >
                    <IconCheck
                      aria-hidden
                      className="size-4 shrink-0 text-primary"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mb-6 text-sm font-medium text-white">
                {product.fit}
              </p>
              {product.href === appMembershipUrl ? (
                <a
                  className={ctaClass}
                  href={product.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {product.cta}
                  <IconArrowUpRight aria-hidden className="size-4" />
                </a>
              ) : (
                <Link className={ctaClass} href={product.href}>
                  {product.cta}
                  <IconArrowUpRight aria-hidden className="size-4" />
                </Link>
              )}
              <p className="mt-3 text-center text-xs text-neutral-400">
                {product.platform}
              </p>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
