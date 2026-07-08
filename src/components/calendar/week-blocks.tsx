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
import { calculateSTL, cn, formatQueryDate, getWeekDays } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { HiddenWorkoutsDialog } from "./hidden-workouts-dialog";

type Workout = Doc<"workouts">;

const MAX_DESKTOP_WORKOUTS_PER_DAY = 3;

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

function getDailyLoad(workouts: Workout[]) {
  return workouts.reduce(
    (sum, workout) =>
      sum +
      calculateSTL(
        workout.rpe,
        workout.trainingMinutes,
        workout.totalRunMiles ?? null,
      ),
    0,
  );
}

function getLoadPercent(dayLoad: number, maxDayLoad: number) {
  if (dayLoad <= 0 || maxDayLoad <= 0) return 0;

  const referenceLoad = Math.max(240, maxDayLoad);

  return Math.min(82, Math.max(24, (dayLoad / referenceLoad) * 82));
}

function getLoadBarClass(loadPercent: number) {
  return loadPercent >= 64 ? "bg-[#f5a61f]" : "bg-[#6ee542]";
}

function WeekBlocksLoading({ weekDays }: { weekDays: Date[] }) {
  return (
    <div className="grid w-full grid-cols-1 gap-2.5 lg:grid-cols-7">
      {weekDays.map((day) => {
        const weekday = day
          .toLocaleString("en-US", { weekday: "short" })
          .toUpperCase();

        return (
          <div
            className="flex w-full flex-col overflow-hidden rounded-[8px] border border-[#141d19] bg-[#080c0a] p-[9px] lg:min-h-[270px]"
            key={day.toISOString()}
          >
            <div className="mb-[6px] flex h-[42px] items-start justify-between px-1 pt-0.5">
              <div className="min-w-0">
                <p className="text-[10px] leading-[13px] font-bold text-[#839288]">
                  {weekday}
                </p>
                <p className="mt-[3px] text-[18px] leading-[23px] font-bold text-[#ecf1e9] tabular-nums">
                  {day.getDate()}
                </p>
              </div>
              <Skeleton className="mt-[7px] h-[5px] w-[38px] rounded-[3px] bg-[#141d19]" />
            </div>
            <div className="flex w-full flex-1 flex-col gap-[6px]">
              <Skeleton className="h-[52px] rounded-[7px] bg-[#0f1712]" />
              <Skeleton className="h-[52px] rounded-[7px] bg-[#0f1712]" />
              <Skeleton className="h-[52px] rounded-[7px] bg-[#0f1712]" />
            </div>
          </div>
        );
      })}
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

  const containerAnimationVariants = shouldReduceMotion
    ? reducedContainerVariants
    : containerVariants;
  const cardAnimationVariants = shouldReduceMotion
    ? reducedCardVariants
    : cardVariants;
  const emptyAnimationVariants = shouldReduceMotion
    ? reducedEmptyStateVariants
    : emptyStateVariants;

  if (data === undefined) return <WeekBlocksLoading weekDays={weekDays} />;

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
  const dayLoads = weekDays.reduce<Record<string, number>>((acc, day) => {
    const dayString = formatQueryDate(day);
    acc[dayString] = getDailyLoad(workoutsByDay[dayString] ?? []);
    return acc;
  }, {});
  const maxDayLoad = Math.max(0, ...Object.values(dayLoads));

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex flex-col gap-2.5">
        <AnimatePresence mode="wait">
          {data.length === 0 ? (
            <m.div
              animate="visible"
              className="w-full"
              exit="exit"
              initial="hidden"
              key="empty"
              variants={emptyAnimationVariants}
            >
              <EmptyWeekState className="border-[#141d19] bg-[#080c0a] text-[#ecf1e9] lg:min-h-[270px]" />
            </m.div>
          ) : (
            <m.div
              animate="visible"
              className="grid w-full grid-cols-1 gap-2.5 lg:grid-cols-7"
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
                const weekday = day
                  .toLocaleString("en-US", { weekday: "short" })
                  .toUpperCase();
                const hiddenWorkoutCount = Math.max(
                  0,
                  dayWorkouts.length - MAX_DESKTOP_WORKOUTS_PER_DAY,
                );
                const loadPercent = getLoadPercent(
                  dayLoads[dayString] ?? 0,
                  maxDayLoad,
                );

                return (
                  <m.div
                    className={cn(
                      "flex w-full flex-col overflow-hidden rounded-[8px] border border-[#141d19] bg-[#080c0a] p-[9px] transition-[border-color,box-shadow] lg:min-h-[270px]",
                      isToday &&
                        "border-[#6ee542]/70 shadow-[0_0_0_1px_rgba(110,229,66,0.18)]",
                    )}
                    key={dayString}
                    variants={{
                      exit: { opacity: 0 },
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 },
                    }}
                  >
                    <div className="mb-[6px] flex h-[42px] items-start justify-between px-1 pt-0.5">
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-[10px] leading-[13px] font-bold text-[#839288]",
                            isToday && "text-[#6ee542]",
                          )}
                        >
                          {weekday}
                        </p>
                        <p className="mt-[3px] text-[18px] leading-[23px] font-bold text-[#ecf1e9] tabular-nums">
                          {day.getDate()}
                        </p>
                      </div>
                      <div className="mt-[7px] h-[5px] w-[38px] overflow-hidden rounded-[3px] bg-[#141d19]">
                        <div
                          className={cn(
                            "h-full rounded-[3px] transition-[width,background-color] duration-300",
                            getLoadBarClass(loadPercent),
                          )}
                          style={{ width: `${loadPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex w-full flex-1 flex-col gap-[6px]">
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
