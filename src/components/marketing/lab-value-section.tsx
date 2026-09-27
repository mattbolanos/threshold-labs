import { MarketingContainer } from "./marketing-container";

const benefits = [
  {
    description:
      "Look beyond a workout screenshot. Open the plan, fueling, training load, and notes to see the full session in context.",
    number: "01",
    title: "The sessions",
  },
  {
    description:
      "Read the Lab Notes behind my training. Understand the reasoning, race strategy, and adjustments alongside the data.",
    number: "02",
    title: "The decisions",
  },
  {
    description:
      "Follow the build into a race and the changes after it. New workouts and notes keep the story moving as the season unfolds.",
    number: "03",
    title: "What happens next",
  },
];

export function LabValueSection() {
  return (
    <section>
      <MarketingContainer className="route-padding-x py-16 sm:py-20">
        <p className="text-xs font-bold tracking-widest text-primary uppercase">
          More context than a social post
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
          The training is only half the story.
        </h2>
        <div className="mt-9 grid gap-8 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              className="border-t border-primary/25 pt-5"
              key={benefit.number}
            >
              <p className="font-mono text-xs text-primary">{benefit.number}</p>
              <h3 className="mt-4 text-xl font-bold text-white">
                {benefit.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-neutral-400">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
