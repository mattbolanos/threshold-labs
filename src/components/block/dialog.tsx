import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { WorkoutsOutput } from "@/server/api/types";
import { DialogFreeText } from "./dialog-free-text";
import { dialogProperties } from "./dialog-properties";
import { DialogProperty } from "./dialog-property";

interface BlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: WorkoutsOutput[number];
}

export function BlockDialog({ open, onOpenChange, workout }: BlockDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{workout.workoutType}</DialogTitle>
        </DialogHeader>
        <div className="-ms-1.5 space-y-1">
          {dialogProperties.map((property) => (
            <DialogProperty
              Icon={property.Icon}
              key={property.label}
              label={property.label}
              value={property.getValue(workout)}
            />
          ))}
          <Separator />
          <DialogFreeText text={workout.workoutPlan} title="Plan" />
          <DialogFreeText text={workout.notes} title="Notes" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
