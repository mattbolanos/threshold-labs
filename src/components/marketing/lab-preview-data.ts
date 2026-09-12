import type { WorkoutWithTrainingBlock } from "@/lib/training-blocks";
import type { Id } from "../../../convex/_generated/dataModel";

export type LabPreviewWorkout =
  | {
      id: string;
      isPreview: false;
      workoutDate: string;
    }
  | {
      id: string;
      isPreview: true;
      workout: WorkoutWithTrainingBlock;
      workoutDate: string;
    };

export type LabPreviewWeek = {
  previewWorkoutCount: number;
  weekEnd: string;
  weekStart: string;
  workouts: LabPreviewWorkout[];
};

const trainingBlock = {
  _creationTime: 1_784_249_176_932.9392,
  _id: "jx7ef84aey81v9q01x8d847gy58aqftw" as Id<"trainingBlocks">,
  createdAt: 1_784_249_176_933,
  description:
    "Base building and initial prep leading into the Fall racing season. The focus here is on being able to tolerate more training load and overall aerobic volume. Intensity will stay mostly even, but there will be more focus on improving efficiency in each HYROX movement.",
  endDate: "2026-09-20",
  startDate: "2026-06-22",
  title: "Base Build + Pre-Season – 13wk",
  updatedAt: 1_784_251_413_288,
};

const lt2RunIntervals: WorkoutWithTrainingBlock = {
  _creationTime: 1_784_041_740_485.2314,
  _id: "j57f4ktybz1sg1s2fg4c9dh7cd8ahrc7" as Id<"workouts">,
  carbs: 125,
  cardioMinutes: 69,
  isHidden: false,
  lt2Miles: 8.1,
  notes:
    "- 100g of carbs fuel gels in this session + 40oz of water/carb mix\n- Splitting this into 3 x (3x5min) really helps get the extra volume in\n- One of my better executed sessions ever, as the pacing was almost even across all 9 intervals\n- Weather conditions a little better than last week",
  rpe: 8,
  speedMiles: 0.15,
  tags: ["Quality Running"],
  title: "LT2 Run Intervals",
  totalRunMiles: 10.33,
  trainingBlock,
  trainingMinutes: 69,
  week: "2026-07-13",
  workoutDate: "2026-07-14",
  workoutPlan:
    "1 mile warmup + 3x20s strides working down to mile pace\n\n9 rounds:\n5 min @ LT2 pace/effort: 5:34/mile target\n60s rest\n\nCooldown: .5 miles very easy after a 5 min rest\n\nNote: After every 3 reps, take 2 min rest to get carbs + hydration in",
};

const aerobicConditioning: WorkoutWithTrainingBlock = {
  _creationTime: 1_784_139_417_889.687,
  _id: "j57b9svxvdaw1v71xxc2e894f18akp1b" as Id<"workouts">,
  burpees: 100,
  carbs: 50,
  cardioMinutes: 54,
  isHidden: false,
  notes:
    "- Solid conditioning session in the heat with one of my clients\n- Getting quality volume in on sled pull, burpees, and wallballs; while keeping it easy on the ergs\n- This is such an easy workout style to add on easy days for higher volume without crushing yourself",
  rpe: 4,
  tags: ["Aerobic Cross Training", "Muscular Endurance", "Sleds"],
  title: "Aerobic Conditioning",
  totalRowKs: 3,
  totalSkiKs: 3,
  trainingBlock,
  trainingMinutes: 54,
  wallballs: 96,
  week: "2026-07-13",
  workoutDate: "2026-07-15",
  workoutPlan:
    "20 min AMRAP:\n300m row @ recovery pace - 2:02/500\n10 burpee to plate burpees\n\n...3min rest...\n\n20 min AMRAP:\n300m ski @ recovery pace - 2:05/500\n12.5m sled pull 10% more than race weight\n\n...3min rest...\n\n6 round EMOM:\n16 wallballs - 1ft | 25lbs",
};

export const LAB_PREVIEW_WEEK: LabPreviewWeek = {
  previewWorkoutCount: 2,
  weekEnd: "2026-07-19",
  weekStart: "2026-07-13",
  workouts: [
    {
      id: "j5706a1p5jd7at88t353ckd4mx8agk2h",
      isPreview: false,
      workoutDate: "2026-07-13",
    },
    {
      id: "j57ff1qgqwb2sn2m07t6zzwwjn8ae034",
      isPreview: false,
      workoutDate: "2026-07-13",
    },
    {
      id: "j5765afx0ma2hs9qy39s9w683s8ajthq",
      isPreview: false,
      workoutDate: "2026-07-14",
    },
    {
      id: "j5706rgwvkqy6qg3ttctbg3nj98ajgre",
      isPreview: false,
      workoutDate: "2026-07-14",
    },
    {
      id: lt2RunIntervals._id,
      isPreview: true,
      workout: lt2RunIntervals,
      workoutDate: lt2RunIntervals.workoutDate,
    },
    {
      id: "j57fm61z92qb5j020pyqkh2nhd8ajykd",
      isPreview: false,
      workoutDate: "2026-07-15",
    },
    {
      id: aerobicConditioning._id,
      isPreview: true,
      workout: aerobicConditioning,
      workoutDate: aerobicConditioning.workoutDate,
    },
    {
      id: "j57fr9kb0bbbg3rehg0dr3z1jx8aj0dq",
      isPreview: false,
      workoutDate: "2026-07-15",
    },
    {
      id: "j57frt897aq8hg9msd6ea8k1f98aq9p6",
      isPreview: false,
      workoutDate: "2026-07-16",
    },
    {
      id: "j57198rdr0b8y915eb06w597gh8anay4",
      isPreview: false,
      workoutDate: "2026-07-16",
    },
    {
      id: "j5760n6yyff94sz4xgsmtxpdxs8aqdx9",
      isPreview: false,
      workoutDate: "2026-07-17",
    },
    {
      id: "j5748px85nny8fam7mbwkk19m98aqrn4",
      isPreview: false,
      workoutDate: "2026-07-17",
    },
    {
      id: "j5765fj8n8kebvqxztdftqddp58apcqv",
      isPreview: false,
      workoutDate: "2026-07-17",
    },
    {
      id: "j576xv2pewd5y07y5nqr4wx84x8avphc",
      isPreview: false,
      workoutDate: "2026-07-18",
    },
    {
      id: "j575m0955zczq2bkpqhkqdrwr18asg50",
      isPreview: false,
      workoutDate: "2026-07-18",
    },
    {
      id: "j570k4kjy26stx3j9emzw4ch5x8avb1d",
      isPreview: false,
      workoutDate: "2026-07-19",
    },
    {
      id: "j57481h6w19ry1srg6agaccy5x8atshn",
      isPreview: false,
      workoutDate: "2026-07-19",
    },
  ],
};
