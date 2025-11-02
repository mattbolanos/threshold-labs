import {
  Calendar1Icon,
  FlameIcon,
  HeartIcon,
  ListIcon,
  RefreshCcwIcon,
  TimerIcon,
  WeightIcon,
} from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatMinutesToTime } from "@/lib/utils";
import type { WorkoutsOutput } from "@/server/api/types";
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
          <DialogProperty
            Icon={Calendar1Icon}
            label="Date"
            value={new Date(workout.workoutDate).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
          <DialogProperty
            Icon={RefreshCcwIcon}
            label="Cycle"
            value={workout.cycle}
          />
          <DialogProperty
            Icon={TimerIcon}
            label="Training Minutes"
            value={formatMinutesToTime(workout.trainingMinutes)}
          />
          <DialogProperty
            Icon={FlameIcon}
            label="RPE"
            value={
              <div className="flex items-center gap-1">
                <span className="text-sm tabular-nums">{workout.rpe}</span>
                <CircularProgress
                  size={24}
                  strokeWidth={3}
                  value={workout.rpe}
                />
              </div>
            }
          />
          <DialogProperty
            Icon={HeartIcon}
            label="Cardio Minutes"
            value={formatMinutesToTime(workout.cardioMinutes)}
          />
          <DialogProperty
            Icon={WeightIcon}
            label="STL"
            value={workout.subjectiveTrainingLoad.toFixed(1)}
          />
          <DialogProperty
            Icon={ListIcon}
            label="Plan"
            value={workout.workoutPlan}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
