"use client";

import { useQuery } from "convex/react";
import { addDays, isSameDay } from "date-fns";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Block } from "@/components/block/block";
import { EmptyWeekState } from "@/components/block/empty-week-state";
import { WeekSummary } from "@/components/block/week-summary";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { cn, formatQueryDate, getWeekDays } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import { WeekSkeleton } from "./week-skeleton";

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

export function WeekBlocks() {
  const { weekStartDate } = useCalendarNav();

  const data = useQuery(api.workouts.getWorkouts, {
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });

  const weekDays = getWeekDays(weekStartDate);

  // Calculate card index for staggered animation across all days
  let globalCardIndex = 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-7 lg:gap-2">
      <WeekSummary
        className="mb-1 lg:hidden"
        key={weekStartDate.toISOString()}
        workouts={data}
      />
      <AnimatePresence mode="wait">
        {data === undefined ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="contents"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="skeleton"
            transition={{ duration: 0.15 }}
          >
            <WeekSkeleton />
          </motion.div>
        ) : data.length === 0 ? (
          <motion.div
            animate="visible"
            className="w-full lg:col-span-7 lg:mt-2"
            exit="exit"
            initial="hidden"
            key="empty"
            variants={emptyStateVariants}
          >
            <EmptyWeekState />
          </motion.div>
        ) : (
          <motion.div
            animate="visible"
            className="contents w-full"
            exit="exit"
            initial="hidden"
            key={weekStartDate.toISOString()}
            variants={containerVariants}
          >
            {weekDays.map((day) => {
              const dayString = formatQueryDate(day);
              const dayWorkouts = data.filter(
                (workout) => workout.workoutDate === dayString,
              );
              const isToday = isSameDay(new Date(), day);

              // Track starting index for this day's cards
              const dayStartIndex = globalCardIndex;
              globalCardIndex += dayWorkouts.length;

              return (
                <motion.div
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
                      <motion.div
                        className="w-full"
                        custom={dayStartIndex + workoutIndex}
                        key={workout._id.toString()}
                        variants={cardVariants as Variants}
                      >
                        <Block className="w-full" workout={workout} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
