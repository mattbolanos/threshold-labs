import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TAG_CONFIG } from "./tag-config";

interface TagBadgeProps {
  tag: string;
  className?: string;
}

export function TagBadge({ tag, className }: TagBadgeProps) {
  const tagConfig = TAG_CONFIG.find((t) => t.tag === tag);
  if (!tagConfig) return null;

  return (
    <Badge
      className={cn(
        "truncate rounded-[6px] border-0 px-1.5 py-0 text-[13px] font-medium",
        tagConfig.color,
        className,
      )}
      variant="outline"
    >
      {tag}
    </Badge>
  );
}
