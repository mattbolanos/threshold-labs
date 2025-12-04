import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CalendarHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-4 lg:flex-row">
      <div className={cn("flex flex-col gap-1 pl-1", className)}>
        {/* Desktop header label */}
        <Skeleton className="hidden h-4 w-20 lg:block" />
        {/* Mobile header label */}
        <Skeleton className="h-5 w-32 lg:hidden" />
        {/* Helper text */}
        <span className="text-muted-foreground hidden text-sm lg:flex">
          Click on a block to view more details
        </span>
      </div>
      <ButtonGroup>
        <ButtonGroup className="mr-auto hidden lg:flex">
          <Button aria-label="Go Back" size="icon-sm" variant="ghost">
            <IconArrowNarrowLeft className="size-5" />
          </Button>
        </ButtonGroup>
        <ButtonGroup className="mr-auto lg:hidden">
          <Button aria-label="Go Back" size="icon-sm" variant="outline">
            <IconArrowNarrowLeft className="size-5" />
          </Button>
        </ButtonGroup>

        <ButtonGroup className="hidden lg:flex">
          <Button aria-label="Go to Today" size="sm" variant="outline">
            Today
          </Button>
        </ButtonGroup>
        <ButtonGroup className="lg:hidden">
          <Button
            aria-label="Go to This Week"
            className="text-xs"
            size="sm"
            variant="outline"
          >
            This Week
          </Button>
        </ButtonGroup>
        <ButtonGroup className="ml-auto hidden lg:flex">
          <Button
            aria-label="Go Forward"
            disabled
            size="icon-sm"
            variant="ghost"
          >
            <IconArrowNarrowRight className="size-5" />
          </Button>
        </ButtonGroup>
        <ButtonGroup className="ml-auto lg:hidden">
          <Button
            aria-label="Go Forward"
            disabled
            size="icon-sm"
            variant="outline"
          >
            <IconArrowNarrowRight className="size-5" />
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    </div>
  );
}
