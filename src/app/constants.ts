import {
  BikeIcon,
  CloudIcon,
  FlameIcon,
  FootprintsIcon,
  HeartIcon,
  MountainIcon,
  ShipIcon,
  ZapIcon,
} from "lucide-react";

export const WORKOUT_TYPES = [
  { icon: FootprintsIcon, title: "Aerobic Run" },
  { icon: MountainIcon, title: "Aerobic Ski" },
  { icon: CloudIcon, title: "Aerobic Run + Speed Endurance" },
  { icon: BikeIcon, title: "Aerobic Bike" },
  { icon: FlameIcon, title: "Quality HYROX Workout" },
  { icon: HeartIcon, title: "VO2 Max Run Intervals" },
  { icon: ShipIcon, title: "Row Intervals + Finisher" },
  { icon: ZapIcon, title: "Ski Metcon" },
] as const;
