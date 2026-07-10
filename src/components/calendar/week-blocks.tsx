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
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { cn, formatQueryDate, getWeekDays } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import { HiddenWorkoutsDialog } from "./hidden-workouts-dialog";

const MAX_DESKTOP_WORKOUTS_PER_DAY = 3;

// Shared spring config for organic feel
const springConfig = {
  damping: 30,
  stiffness: 300,
  type: "spring" as const,
};

// Card entrance animation variants
const cardVariants = {
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

// Block-list variants keep the day columns stable while coordinating cards.
const blockListVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.1,
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

const reducedBlockListVariants = {
  hidden: {},
  visible: {},
};

const reducedCardVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const reducedEmptyStateVariants = {
  exit: { opacity: 1 },
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

function WeekBlocksLoading() {
  return (
    <div className="flex w-full flex-1 flex-col gap-1.5">
      <Skeleton className="bg-muted h-13 rounded-lg motion-reduce:animate-none" />
      <Skeleton className="bg-muted h-13 rounded-lg motion-reduce:animate-none" />
      <Skeleton className="bg-muted h-13 rounded-lg motion-reduce:animate-none" />
    </div>
  );
}

export function WeekBlocks() {
  const { weekStartDate } = useCalendarNav();
  const shouldReduceMotion = useReducedMotion();

  const data = useQuery(api.workouts.getWorkouts, {
    from: formatQueryDate(weekStartDate),
    to: formatQueryDate(addDays(weekStartDate, 6)),
  });

  const weekDays = getWeekDays(weekStartDate);

  const blockListAnimationVariants = shouldReduceMotion
    ? reducedBlockListVariants
    : blockListVariants;
  const cardAnimationVariants = shouldReduceMotion
    ? reducedCardVariants
    : cardVariants;
  const emptyAnimationVariants = shouldReduceMotion
    ? reducedEmptyStateVariants
    : emptyStateVariants;

  const isLoading = data === undefined;
  const workouts = data ?? [];

  const workoutsByDay = workouts.reduce<Record<string, typeof workouts>>(
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
      <div className="flex flex-col gap-2.5">
        <AnimatePresence mode="wait">
          {data?.length === 0 ? (
            <m.div
              animate="visible"
              className="w-full"
              exit="exit"
              initial="hidden"
              key="empty"
              variants={emptyAnimationVariants}
            >
              <EmptyWeekState className="bg-card text-card-foreground lg:min-h-68" />
            </m.div>
          ) : (
            <m.div
              animate={{ opacity: 1 }}
              className="grid w-full grid-cols-1 gap-2.5 lg:grid-cols-7"
              exit={
                shouldReduceMotion
                  ? undefined
                  : { opacity: 0, transition: { duration: 0.12 } }
              }
              initial={false}
              key="week-grid"
            >
              {weekDays.map((day) => {
                const dayString = formatQueryDate(day);
                const dayWorkouts = workoutsByDay[dayString] ?? [];
                const isToday = isSameDay(new Date(), day);
                const dayStartIndex = dayStartIndices[dayString] ?? 0;
                const weekday = day
                  .toLocaleString("en-US", { weekday: "short" })
                  .toUpperCase();
                const hiddenWorkoutCount = Math.max(
                  0,
                  dayWorkouts.length - MAX_DESKTOP_WORKOUTS_PER_DAY,
                );
                return (
                  <div
                    className={cn(
                      "bg-card flex w-full flex-col overflow-hidden rounded-lg border p-2 transition-shadow lg:min-h-68",
                      isToday && "border-primary/70 shadow-sm",
                    )}
                    key={day.getDay()}
                  >
                    <div className="mb-2 flex items-start justify-between px-1 pt-0.5">
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-muted-foreground text-xs font-bold",
                            isToday && "text-primary",
                          )}
                        >
                          {weekday}
                        </p>
                        <p className="mt-1 text-lg font-bold tabular-nums">
                          {day.getDate()}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full flex-1">
                      {isLoading ? (
                        <WeekBlocksLoading />
                      ) : (
                        <m.div
                          animate="visible"
                          className="flex w-full flex-1 flex-col gap-1.5"
                          initial="hidden"
                          key={dayString}
                          variants={blockListAnimationVariants}
                        >
                          {dayWorkouts.map((workout, workoutIndex) => (
                            <m.div
                              className={cn(
                                "w-full",
                                workoutIndex >= MAX_DESKTOP_WORKOUTS_PER_DAY &&
                                  "lg:hidden",
                              )}
                              custom={dayStartIndex + workoutIndex}
                              key={workout._id.toString()}
                              variants={cardAnimationVariants as Variants}
                            >
                              <Block className="w-full" workout={workout} />
                            </m.div>
                          ))}
                          {hiddenWorkoutCount > 0 && (
                            <HiddenWorkoutsDialog
                              day={day}
                              hiddenWorkoutCount={hiddenWorkoutCount}
                              visibleWorkoutCount={MAX_DESKTOP_WORKOUTS_PER_DAY}
                              workouts={dayWorkouts}
                            />
                          )}
                        </m.div>
                      )}
                    </div>
                  </div>
                );
              })}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
