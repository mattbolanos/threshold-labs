import Link from "next/link";
import { insideLabMembership } from "@/lib/billing";
import { appMembership } from "@/lib/marketing-content";
import { MarketingContainer } from "./marketing-container";

const questions = [
  {
    answer: `Inside the Lab is access to Stephen’s training and analysis. If you want a structured program to follow for your own goals, choose the ${appMembership.priceLabel} Threshold Lab App membership. The two products are purchased separately.`,
    question: "Is this a training plan for me?",
  },
  {
    answer:
      "Your membership starts with training data from the 30 days before you sign up. New workouts are included as they land while you remain subscribed, alongside performance charts and every Lab Note, past and future.",
    question: "What can I see when I join?",
  },
  {
    answer:
      "No. The membership stands on its own. Historical blocks are optional purchases if you want to study training outside your membership access window.",
    question: "Do I need to buy older blocks?",
  },
  {
    answer:
      "Yes. Cancel future renewals from your billing settings. Your membership access continues through the end of the current billing period.",
    question: "Can I cancel?",
  },
  {
    answer:
      "No. Inside the Lab, the Threshold Lab App, and 1:1 coaching are separate offerings. Choose Inside the Lab to study Stephen’s process; choose the app for structured programs and community.",
    question: "Does this include personal coaching or the app?",
  },
];

export function LabPricingDetails() {
  return (
    <>
      <section>
        <MarketingContainer className="route-padding-x py-16 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <p className="text-xs font-bold tracking-widest text-primary uppercase">
                Before you join
              </p>
              <h2 className="mt-3 text-3xl font-black text-white">
                A few things to know.
              </h2>
            </div>
            <div className="lg:col-span-2">
              {questions.map((item) => (
                <details
                  className="group border-b border-white/10 py-5 first:border-t"
                  key={item.question}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-white">
                    {item.question}
                    <span
                      aria-hidden
                      className="text-xl text-primary group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </MarketingContainer>
      </section>
      <section className="border-y border-primary/20 bg-primary/5">
        <MarketingContainer className="route-padding-x flex flex-col gap-8 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Follow the next chapter.
            </h2>
            <p className="mt-3 text-neutral-400">
              The sessions. The thinking. The changes along the way.
            </p>
          </div>
          <Link
            className="rounded-full bg-primary px-6 py-4 text-center text-sm font-bold text-neutral-950 hover:brightness-110"
            href="/subscribe?purchase=membership"
          >
            Join Inside the Lab · {insideLabMembership.priceLabel} ↗
          </Link>
        </MarketingContainer>
      </section>
    </>
  );
}
