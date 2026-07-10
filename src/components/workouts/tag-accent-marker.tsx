import { cn } from "@/lib/utils";
import { getTagAccentColors } from "./tag-config";

const MAX_VISIBLE_TAGS = 3;

interface TagAccentMarkerProps {
  className?: string;
  tags: string[];
}

export function getTagAccentOverflowCount(tags: string[]) {
  return Math.max(0, getTagAccentColors(tags).length - MAX_VISIBLE_TAGS);
}

export function TagAccentMarker({ className, tags }: TagAccentMarkerProps) {
  const accentColors = getTagAccentColors(tags).slice(0, MAX_VISIBLE_TAGS);

  if (accentColors.length === 0) return null;

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-y-px -left-px flex w-1 flex-col gap-0.5 overflow-hidden rounded-xs",
        className,
      )}
      data-slot="tag-accent-border"
    >
      {accentColors.map((accentColor) => (
        <span
          className="min-h-0 flex-1 rounded-xs"
          key={accentColor}
          style={{ backgroundColor: accentColor }}
        />
      ))}
    </span>
  );
}
