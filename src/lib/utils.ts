import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutesToTime(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(String(hours).padStart(2, "0"));
  }
  parts.push(String(mins).padStart(2, "0"));
  parts.push(String(secs).padStart(2, "0"));

  return parts.join(":");
}
