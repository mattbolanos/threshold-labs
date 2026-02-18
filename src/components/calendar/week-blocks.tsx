"use client";

import { useQuery } from "convex/react";
import { addDays, isSameDay } from "date-fns";
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Block } from "@/components/block/block";
import { EmptyWeekState } from "@/components/block/empty-week-state";
import { WeekSummary } from "@/components/block/week-summary";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { cn, formatQueryDate, getWeekDays } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";

// Shared spring config for organic feel
const springConfig = {
  damping: 30,
  stiffness: 300,
  type: "spring" as const,
};

// Card enter/exit animation variants
const cardVariants = {
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" },
    y: -8,
  },
  hidden: {
    opacity: 0,
    scale: 0.97,
    y: 12,
  },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      ...springConfig,
      delay: i * 0.05, // 50ms stagger per card
    },
    y: 0,
  }),
};

// Container variants for coordinated children
const containerVariants = {
  exit: {
    opacity: 0,
    transition: { duration: 0.12 },
  },
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.03,
    },
  },
};

// Empty state animation
const emptyStateVariants = {
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.12 },
  },
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfig,
  },
};

const reducedContainerVariants = {
  exit: { opacity: 0 },
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const reducedCardVariants = {
  exit: { opacity: 0 },
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const reducedEmptyStateVariants = {
  exit: { opacity: 0 },
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function WeekBlocks() {
  const { weekStartDate } = useCalendarNav();
  const shouldReduceMotion = useReducedMotion();

  const data = useQuery(api.workouts.getWorkouts, {
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });

  const weekDays = getWeekDays(weekStartDate);

  const containerAnimationVariants = shouldReduceMotion
    ? reducedContainerVariants
    : containerVariants;
  const cardAnimationVariants = shouldReduceMotion
    ? reducedCardVariants
    : cardVariants;
  const emptyAnimationVariants = shouldReduceMotion
    ? reducedEmptyStateVariants
    : emptyStateVariants;

  if (data === undefined) return null;

  const workoutsByDay = data.reduce<Record<string, typeof data>>(
    (acc, workout) => {
      const dayWorkouts = acc[workout.workoutDate] ?? [];
      dayWorkouts.push(workout);
      acc[workout.workoutDate] = dayWorkouts;
      return acc;
    },
    {},
  );

  const dayStartIndices = weekDays.reduce<Record<string, number>>(
    (acc, day, index) => {
      const dayString = formatQueryDate(day);

      if (index === 0) {
        acc[dayString] = 0;
        return acc;
      }

      const previousDay = weekDays[index - 1];
      const previousDayString = formatQueryDate(previousDay);
      const previousDayCount = workoutsByDay[previousDayString]?.length ?? 0;
      acc[dayString] = (acc[previousDayString] ?? 0) + previousDayCount;
      return acc;
    },
    {},
  );

  return (
    <LazyMotion features={domAnimation}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7 lg:gap-2">
        <WeekSummary
          className="mb-1 lg:hidden"
          key={weekStartDate.toISOString()}
          workouts={data}
        />
        <AnimatePresence mode="wait">
          {data.length === 0 ? (
            <m.div
              animate="visible"
              className="w-full lg:col-span-7 lg:mt-2"
              exit="exit"
              initial="hidden"
              key="empty"
              variants={emptyAnimationVariants}
            >
              <EmptyWeekState />
            </m.div>
          ) : (
            <m.div
              animate="visible"
              className="contents w-full"
              exit="exit"
              initial="hidden"
              key={weekStartDate.toISOString()}
              variants={containerAnimationVariants}
            >
              {weekDays.map((day) => {
                const dayString = formatQueryDate(day);
                const dayWorkouts = workoutsByDay[dayString] ?? [];
                const isToday = isSameDay(new Date(), day);
                const dayStartIndex = dayStartIndices[dayString] ?? 0;

                return (
                  <m.div
                    className={cn("w-full flex-col gap-2")}
                    key={dayString}
                    variants={{
                      exit: { opacity: 0 },
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 },
                    }}
                  >
                    <h3
                      className={cn(
                        "pb-2 text-sm font-semibold lg:hidden",
                        isToday && "text-primary",
                      )}
                    >
                      {day.toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        weekday: "long",
                        year: "numeric",
                      })}
                    </h3>
                    <div className="flex w-full flex-col gap-2">
                      {dayWorkouts.map((workout, workoutIndex) => (
                        <m.div
                          className="w-full"
                          custom={dayStartIndex + workoutIndex}
                          key={workout._id.toString()}
                          variants={cardAnimationVariants as Variants}
                        >
                          <Block className="w-full" workout={workout} />
                        </m.div>
                      ))}
                    </div>
                  </m.div>
                );
              })}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
