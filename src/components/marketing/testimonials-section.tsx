"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { testimonials } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "./marketing-container";

export function TestimonialsSection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [expandedTestimonials, setExpandedTestimonials] = useState<Set<string>>(
    () => new Set(),
  );

  const updateScrollControls = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    setCanScrollLeft(slider.scrollLeft > 8);
    setCanScrollRight(
      slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 8,
    );
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    updateScrollControls();
    const resizeObserver = new ResizeObserver(updateScrollControls);
    resizeObserver.observe(slider);
    slider.addEventListener("scroll", updateScrollControls, { passive: true });

    return () => {
      resizeObserver.disconnect();
      slider.removeEventListener("scroll", updateScrollControls);
    };
  }, [updateScrollControls]);

  function scrollTestimonials(direction: -1 | 1) {
    const slider = sliderRef.current;
    const card = slider?.querySelector<HTMLElement>("article");

    if (!slider || !card) {
      return;
    }

    const gap = Number.parseFloat(getComputedStyle(slider).columnGap) || 0;

    slider.scrollBy({
      behavior: "smooth",
      left: direction * (card.offsetWidth + gap),
    });
  }

  function toggleTestimonial(name: string) {
    setExpandedTestimonials((current) => {
      const next = new Set(current);

      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }

      return next;
    });
  }

  return (
    <section className="scroll-mt-24" id="results">
      <MarketingContainer className="route-padding-x pt-10 pb-16 sm:pt-12 sm:pb-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest text-primary uppercase">
              Athlete results
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
              The work shows up on race day.
            </h2>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              aria-label="View previous athlete result"
              className="flex size-11 items-center justify-center rounded-full border border-primary/20 bg-neutral-900 text-primary transition hover:border-primary/50 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={!canScrollLeft}
              onClick={() => scrollTestimonials(-1)}
              type="button"
            >
              <IconArrowLeft aria-hidden className="size-5" />
            </button>
            <button
              aria-label="View next athlete result"
              className="flex size-11 items-center justify-center rounded-full border border-primary/20 bg-neutral-900 text-primary transition hover:border-primary/50 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={!canScrollRight}
              onClick={() => scrollTestimonials(1)}
              type="button"
            >
              <IconArrowRight aria-hidden className="size-5" />
            </button>
          </div>
        </div>

        <div
          className="marketing-slider -mx-5 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto scroll-smooth px-5 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0"
          ref={sliderRef}
        >
          {testimonials.map((testimonial) => {
            const isExpanded = expandedTestimonials.has(testimonial.name);

            return (
              <article
                className="w-80 flex-none snap-start overflow-hidden rounded-3xl border border-primary/15 bg-neutral-900/75 sm:w-96"
                key={testimonial.name}
              >
                <div className="relative h-48 overflow-hidden bg-neutral-800">
                  <Image
                    alt={`${testimonial.name} athlete result`}
                    className="object-cover object-center"
                    fill
                    sizes="(max-width: 640px) 320px, 384px"
                    src={testimonial.image}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-neutral-900 to-transparent" />
                  <p className="absolute right-4 bottom-4 left-4 text-xl font-black tracking-tight text-white">
                    {testimonial.result}
                  </p>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <span className="text-xs font-bold text-primary uppercase">
                      {testimonial.program}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-4 text-sm leading-6 whitespace-pre-line text-neutral-400",
                      !isExpanded && "line-clamp-3",
                    )}
                  >
                    “{testimonial.quote}”
                  </p>
                  <button
                    aria-expanded={isExpanded}
                    className="mt-3 cursor-pointer text-sm font-bold text-primary"
                    onClick={() => toggleTestimonial(testimonial.name)}
                    type="button"
                  >
                    {isExpanded ? "Read less" : "Read more"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-2 text-xs font-medium text-neutral-500">
          Swipe or scroll to see more results.
        </p>
      </MarketingContainer>
    </section>
  );
}
