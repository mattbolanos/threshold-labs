import { Separator } from "@/components/ui/separator";
import type { WorkoutsOutput } from "@/server/api/types";
import { DialogFreeText } from "./dialog-free-text";
import { dialogProperties } from "./dialog-properties";
import { DialogProperty } from "./dialog-property";

interface BlockContentProps {
  workout: WorkoutsOutput[number];
}

export function BlockContent({ workout }: BlockContentProps) {
  return (
    <div className="space-y-1 overflow-y-auto px-2 pb-8 md:-ms-1.5 md:px-0 md:pb-0">
      {dialogProperties.map((property) => (
        <DialogProperty
          Icon={property.Icon}
          key={property.label}
          label={property.label}
          value={property.getValue(workout)}
        />
      ))}
      <div className="my-4 space-y-4 px-1.5">
        <Separator />
        <div className="space-y-8">
          <DialogFreeText text={workout.workoutPlan} title="Plan" />
          <DialogFreeText text={workout.notes} title="Notes" />
        </div>
      </div>
    </div>
  );
}
