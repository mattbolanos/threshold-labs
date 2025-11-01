import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WorkoutsOutput } from "@/server/api/types";

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
      </DialogContent>
    </Dialog>
  );
}
