import {
  BikeIcon,
  BrickWallIcon,
  FlameIcon,
  HeartIcon,
  type LucideIcon,
} from "lucide-react";

interface TagConfig {
  color: string;
  icon: LucideIcon;
  tag: string;
}

export const TAG_CONFIG: TagConfig[] = [
  {
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-600 dark:text-foreground border-emerald-200 dark:border-emerald-800",
    icon: HeartIcon,
    tag: "Aerobic Cross Training",
  },
  {
    color:
      "bg-green-100 text-green-700 dark:bg-green-600 dark:text-foreground border-green-200 dark:border-green-800",
    icon: HeartIcon,
    tag: "Aerobic Run",
  },
  {
    color:
      "bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-foreground border-slate-200 dark:border-slate-800",
    icon: FlameIcon,
    tag: "Bad Heart Rate Data",
  },
  {
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-600 dark:text-foreground border-violet-200 dark:border-violet-800",
    icon: FlameIcon,
    tag: "Muscular Endurance",
  },
  {
    color:
      "bg-pink-100 text-pink-700 dark:bg-pink-600 dark:text-foreground border-pink-200 dark:border-pink-800",
    icon: BikeIcon,
    tag: "Quality Cross Training",
  },
  {
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-foreground border-yellow-200 dark:border-yellow-800",
    icon: BrickWallIcon,
    tag: "Quality HYROX",
  },
  {
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-600 dark:text-foreground border-orange-200 dark:border-orange-800",
    icon: FlameIcon,
    tag: "Quality Running",
  },
  {
    color:
      "bg-red-100 text-red-700 dark:bg-red-600 dark:text-foreground border-red-200 dark:border-red-800",
    icon: FlameIcon,
    tag: "Race",
  },
  {
    color:
      "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-foreground border-blue-200 dark:border-blue-800",
    icon: BrickWallIcon,
    tag: "Strength",
  },
];
