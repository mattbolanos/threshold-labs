import { Separator } from "@/components/ui/separator";
import type { WorkoutsOutput } from "@/server/api/types";
import { FreeText } from "./free-text";
import { PropertyRow } from "./property-row";
import { WORKOUT_PROPERTY_CONFIG } from "./workout-property-config";

interface BlockContentProps {
  workout: WorkoutsOutput[number];
}

export function BlockContent({ workout }: BlockContentProps) {
  return (
    <div className="space-y-1 overflow-y-auto px-2 md:-ms-1.5 md:px-0">
      {WORKOUT_PROPERTY_CONFIG.map((property) => (
        <PropertyRow
          Icon={property.Icon}
          key={property.label}
          label={property.label}
          value={property.getValue(workout)}
        />
      ))}
      <div className="my-4 space-y-4 px-1.5">
        <Separator />
        <div className="space-y-6 sm:space-y-8">
          <FreeText text={workout.workoutPlan} title="Plan" />
          <FreeText text={workout.notes} title="Notes" />
        </div>
      </div>
    </div>
  );
}
