import {
  IconBarbell,
  IconBike,
  IconHeartBroken,
  IconListCheck,
  IconRun,
  IconSleigh,
  IconStretching,
  IconTrophy,
  IconWeight,
  type TablerIcon,
} from "@tabler/icons-react";

export interface TagConfig {
  accentColor: string;
  color: string;
  icon: TablerIcon;
  iconColor: string;
  tag: string;
}

export const TAG_CONFIG: TagConfig[] = [
  {
    accentColor: "var(--color-blue-500)",
    color: "dark:text-foreground dark:bg-blue-600 bg-blue-500/20 text-blue-700",
    icon: IconStretching,
    iconColor: "text-blue-700",
    tag: "Aerobic Cross Training",
  },
  {
    accentColor: "var(--color-emerald-500)",
    color:
      "dark:text-foreground dark:bg-emerald-800 bg-emerald-500/20 text-emerald-700",
    icon: IconRun,
    iconColor: "text-emerald-700",
    tag: "Aerobic Run",
  },
  {
    accentColor: "var(--color-stone-500)",
    color:
      "dark:text-foreground dark:bg-stone-600 bg-stone-500/20 text-stone-700",
    icon: IconHeartBroken,
    iconColor: "text-stone-700",
    tag: "Bad Heart Rate Data",
  },
  {
    accentColor: "var(--color-rose-500)",
    color: "dark:text-foreground dark:bg-rose-600 bg-rose-500/20 text-rose-700",
    icon: IconBarbell,
    iconColor: "text-rose-700",
    tag: "Muscular Endurance",
  },
  {
    accentColor: "var(--color-violet-500)",
    color:
      "dark:text-foreground dark:bg-violet-600 bg-violet-500/20 text-violet-700",
    icon: IconBike,
    iconColor: "text-violet-700",
    tag: "Quality Cross Training",
  },
  {
    accentColor: "var(--color-orange-500)",
    color:
      "dark:text-foreground dark:bg-orange-500/80 bg-orange-500/20 text-orange-700",
    icon: IconListCheck,
    iconColor: "text-orange-700",
    tag: "Quality HYROX",
  },
  {
    accentColor: "var(--color-yellow-500)",
    color:
      "dark:text-foreground dark:bg-yellow-600 bg-yellow-500/20 text-yellow-700",
    icon: IconRun,
    iconColor: "text-yellow-700",
    tag: "Quality Running",
  },
  {
    accentColor: "var(--color-red-500)",
    color: "dark:text-foreground dark:bg-red-500/80 bg-red-500/20 text-red-700",
    icon: IconTrophy,
    iconColor: "text-red-700",
    tag: "Race",
  },
  {
    accentColor: "var(--color-cyan-500)",
    color: "dark:text-foreground dark:bg-cyan-700 bg-cyan-500/20 text-cyan-700",
    icon: IconSleigh,
    iconColor: "text-cyan-700",
    tag: "Sleds",
  },
  {
    accentColor: "var(--color-amber-700)",
    color:
      "dark:text-foreground dark:bg-amber-600 bg-amber-700/20 text-amber-800",
    icon: IconWeight,
    iconColor: "text-amber-800",
    tag: "Strength",
  },
];

export function getTagAccentColors(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .map(
          (tag) => TAG_CONFIG.find((config) => config.tag === tag)?.accentColor,
        )
        .filter((color): color is string => Boolean(color)),
    ),
  );
}
