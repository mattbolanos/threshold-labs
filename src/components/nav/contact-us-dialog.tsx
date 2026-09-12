"use client";

import { IconSend } from "@tabler/icons-react";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { type ComponentProps, type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../convex/_generated/api";

export function ContactUsDialog({
  email,
  isPreview,
  size = "default",
}: {
  email: string;
  isPreview: boolean;
  size?: ComponentProps<typeof Button>["size"];
}) {
  const sendMessage = useAction(api.emails.sendContactMessage);
  const messageId = useId();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || isPreview || !message.trim()) return;
    setPending(true);
    setError(null);
    try {
      await sendMessage({ message: message.trim() });
      setMessage("");
      setSent(true);
    } catch (error) {
      setError(
        error instanceof ConvexError
          ? String(error.data)
          : "Your message could not be sent. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (pending) return;
        setOpen(nextOpen);
        if (nextOpen) {
          setSent(false);
          setError(null);
        }
      }}
      open={open}
    >
      <DialogTrigger
        render={
          <Button
            className="w-full justify-start"
            size={size}
            variant="ghost"
          />
        }
      >
        <IconSend aria-hidden data-icon="inline-start" />
        Contact us
      </DialogTrigger>
      <DialogContent className="max-w-md" showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>Contact us</DialogTitle>
          <DialogDescription>
            {sent
              ? "Thanks for reaching out. We'll reply to your account email."
              : isPreview
                ? "Sign in to your account to send us a message."
                : `Have a question or feedback? We'll reply to ${email}.`}
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <>
            <output className="text-sm">Your message has been sent.</output>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor={messageId}>Message</Label>
              <Textarea
                className="min-h-32"
                disabled={pending || isPreview}
                id={messageId}
                maxLength={5000}
                name="message"
                onChange={(event) => setMessage(event.target.value)}
                placeholder="How can we help?"
                required
                value={message}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              disabled={pending || isPreview || !message.trim()}
              type="submit"
            >
              <span aria-live="polite">
                {pending ? "Sending…" : "Send message"}
              </span>
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
