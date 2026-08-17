import { IconLoader, type IconProps } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: IconProps) {
  return (
    <IconLoader
      aria-hidden="true"
      className={cn("size-4 animate-spin", className)}
      data-slot="spinner"
      {...props}
    />
  );
}

export { Spinner };
