import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { insideLabMembership } from "@/lib/billing";
import { MarketingContainer } from "./marketing-container";

export function LabMembershipPitch() {
  return (
    <section className="relative overflow-hidden border-b border-primary/15">
      <div className="marketing-grid pointer-events-none absolute inset-0 opacity-40" />
      <MarketingContainer className="route-padding-x relative grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            Inside the Lab · with Stephen Pelkofer
          </p>
          <h1 className="mt-5 text-5xl leading-none font-black tracking-tighter text-white sm:text-6xl">
            See the work.
            <br />
            <span className="text-primary">Understand the why.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-400">
            A race result tells you what happened. Inside the Lab shows you how
            I got there: the training, the data, the decisions, and what I
            change next.
          </p>
          <div className="mt-7 flex items-center gap-3">
            <Image
              alt="Stephen Pelkofer"
              className="size-12 rounded-full object-cover"
              height={48}
              src="/marketing/coach-pic.jpg"
              width={48}
            />
            <p className="text-sm text-neutral-300">
              Stephen Pelkofer
              <span className="mt-1 block text-xs text-neutral-400">
                HYROX coach & Elite 15 athlete
              </span>
            </p>
          </div>
          <a
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary underline-offset-4 hover:underline"
            href="#lab-preview"
          >
            Explore a sample training week ↓
          </a>
        </div>
        <div className="overflow-hidden rounded-3xl border border-primary/40 bg-neutral-950 shadow-2xl">
          <div className="border-b border-primary/20 bg-primary/10 px-7 py-3 text-xs font-bold tracking-widest text-primary uppercase">
            Follow the ongoing process
          </div>
          <div className="p-7 sm:p-9">
            <h2 className="text-2xl font-bold text-white">
              Inside the Lab membership
            </h2>
            <p className="mt-5 text-6xl font-black tracking-tight text-white">
              ${insideLabMembership.price}
              <span className="text-base font-normal tracking-normal text-neutral-400">
                {" "}
                / month
              </span>
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              Billed monthly. Cancel future renewals anytime.
            </p>
            <ul className="my-7 space-y-4">
              {[
                "Training from 30 days before you join, plus new workouts as they land",
                "Full training overview and performance charts",
                "Every Lab Note, past and future",
                "Race schedule, strategy, and recaps",
              ].map((feature) => (
                <li
                  className="flex gap-3 text-sm leading-6 text-neutral-300"
                  key={feature}
                >
                  <IconCheck
                    aria-hidden
                    className="mt-1 size-4 shrink-0 text-primary"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-sm font-bold text-neutral-950 transition hover:brightness-110"
              href="/subscribe?purchase=membership"
            >
              Join Inside the Lab
              <IconArrowRight aria-hidden className="size-4" />
            </Link>
            <p className="mt-4 text-center text-xs leading-5 text-neutral-400">
              Create an account, then complete secure checkout.
              <br />
              The training app and older training blocks are sold separately.
            </p>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
