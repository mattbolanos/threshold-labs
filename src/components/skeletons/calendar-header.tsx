import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CalendarHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-4 md:flex-row">
      <div className={cn("flex flex-col gap-2 pl-1", className)}>
        {/* Desktop header label */}
        <Skeleton className="hidden h-4 w-48 md:block" />
        {/* Mobile header label */}
        <Skeleton className="h-5 w-32 md:hidden" />
        {/* Helper text */}
        <Skeleton className="hidden h-4 w-64 md:block" />
      </div>
      <ButtonGroup>
        <ButtonGroup className="mr-auto hidden md:flex">
          <Button aria-label="Go Back" disabled size="icon-sm" variant="ghost">
            <ArrowLeftIcon className="size-5" />
          </Button>
        </ButtonGroup>
        <ButtonGroup className="mr-auto md:hidden">
          <Button
            aria-label="Go Back"
            disabled
            size="icon-sm"
            variant="outline"
          >
            <ArrowLeftIcon className="size-5" />
          </Button>
        </ButtonGroup>

        <ButtonGroup className="hidden md:flex">
          <Button aria-label="Go to Today" disabled size="sm" variant="outline">
            Today
          </Button>
        </ButtonGroup>
        <ButtonGroup className="md:hidden">
          <Button
            aria-label="Go to This Week"
            className="text-xs"
            disabled
            size="sm"
            variant="outline"
          >
            This Week
          </Button>
        </ButtonGroup>
        <ButtonGroup className="ml-auto hidden md:flex">
          <Button
            aria-label="Go Forward"
            disabled
            size="icon-sm"
            variant="ghost"
          >
            <ArrowRightIcon className="size-5" />
          </Button>
        </ButtonGroup>
        <ButtonGroup className="ml-auto md:hidden">
          <Button
            aria-label="Go Forward"
            disabled
            size="icon-sm"
            variant="outline"
          >
            <ArrowRightIcon className="size-5" />
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    </div>
  );
}
