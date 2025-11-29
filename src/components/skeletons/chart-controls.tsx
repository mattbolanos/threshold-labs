import { Button } from "@/components/ui/button";

export function ChartControlsSkeleton() {
  return (
    <div className="route-padding-x flex items-center justify-end">
      <Button className="text-xs" disabled variant="outline">
        Select Date Range
      </Button>
    </div>
  );
}
