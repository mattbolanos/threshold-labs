"use client";

import { IconLoader2, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DeleteRecordButtonProps = {
  description: string;
  label: string;
  onDelete: () => Promise<unknown>;
};

export function DeleteRecordButton({
  description,
  label,
  onDelete,
}: DeleteRecordButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setErrorMessage(null);
    setIsDeleting(true);
    try {
      await onDelete();
      setOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "This item could not be deleted.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button
            aria-label={`Delete ${label}`}
            size="icon-sm"
            variant="ghost"
          />
        }
      >
        <IconTrash />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {label}?</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Delete failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        <DialogFooter>
          <DialogClose
            render={<Button disabled={isDeleting} variant="outline" />}
          >
            Cancel
          </DialogClose>
          <Button
            disabled={isDeleting}
            onClick={() => void handleDelete()}
            variant="destructive"
          >
            {isDeleting ? (
              <IconLoader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <IconTrash data-icon="inline-start" />
            )}
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
