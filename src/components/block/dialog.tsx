import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
  const Content = () => {
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
  };
  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent
          className="hidden md:grid"
          overlayClassName="md:flex hidden"
        >
          <DialogHeader>
            <DialogTitle>{workout.workoutType}</DialogTitle>
          </DialogHeader>
          <Content />
        </DialogContent>
      </Dialog>
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent className="md:hidden" overlayClassName="md:hidden">
          <DrawerHeader>
            <DrawerTitle>{workout.workoutType}</DrawerTitle>
          </DrawerHeader>
          <Content />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button>Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
