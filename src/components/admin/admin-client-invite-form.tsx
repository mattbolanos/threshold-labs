"use client";

import { IconCheck, IconLoader2, IconMailPlus } from "@tabler/icons-react";
import { useMutation } from "convex/react";
import { useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { api as convexApi } from "../../../convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withMinimumDuration<T>(promise: Promise<T>, minimumMs = 350) {
  const startedAt = Date.now();
  try {
    return await promise;
  } finally {
    const elapsed = Date.now() - startedAt;
    if (elapsed < minimumMs) {
      await wait(minimumMs - elapsed);
    }
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleOptions = [
  {
    description: "Standard member role; Lab access requires a subscription.",
    label: "Client",
    value: "client",
  },
  {
    description: "Grants admin and Lab access when applied at first signup.",
    label: "Admin",
    value: "admin",
  },
  {
    description: "Coach label; Lab access still requires a subscription.",
    label: "Coach",
    value: "coach",
  },
] as const;

type ClientRole = (typeof roleOptions)[number]["value"];

type InviteFormState = {
  email: string;
  isActive: boolean;
  name: string;
  role: ClientRole;
};

const DEFAULT_FORM_STATE: InviteFormState = {
  email: "",
  isActive: true,
  name: "",
  role: "client",
};

export function AdminClientInviteForm() {
  const upsertClientInvite = useMutation(convexApi.auth.upsertClientInvite);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const emailId = useId();
  const nameId = useId();
  const roleId = useId();
  const statusId = useId();

  const [form, setForm] = useState<InviteFormState>(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const selectedRole = roleOptions.find((option) => option.value === form.role);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage("");

    const normalizedEmail = form.email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError("Email is required.");
      emailInputRef.current?.focus();
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailError("Enter a valid email address.");
      emailInputRef.current?.focus();
      return;
    }

    setEmailError(null);
    setIsSubmitting(true);

    await withMinimumDuration(
      upsertClientInvite({
        email: normalizedEmail,
        isActive: form.isActive,
        name: form.name.trim() || undefined,
        role: form.role,
      }),
    )
      .then(() => {
        setStatusMessage(
          `${normalizedEmail}: ${selectedRole?.label ?? "Client"} role default saved (${form.isActive ? "active" : "paused"}).`,
        );
        setForm((prev) => ({
          ...prev,
          email: "",
          name: "",
        }));
        emailInputRef.current?.focus();
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to save invite.",
        );
      });
    setIsSubmitting(false);
  };

  return (
    <Card className="border-primary/20 from-card via-card to-muted/30 bg-gradient-to-br py-0 shadow-sm">
      <CardHeader className="px-4 pt-4 md:px-5 md:pt-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight">
              Pre-signup role default
            </CardTitle>
            <CardDescription>
              Save the role an email should receive at first signup. This does
              not block account creation or change an existing user.
            </CardDescription>
          </div>
          <Badge variant={form.isActive ? "default" : "secondary"}>
            {form.isActive ? "Default active" : "Default paused"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 md:px-5 md:pb-5">
        <div aria-atomic aria-live="polite" className="sr-only">
          {statusMessage || errorMessage || ""}
        </div>

        {errorMessage ? (
          <p
            className="bg-destructive/10 text-destructive border-destructive/30 rounded-lg border px-3 py-2 text-sm"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        {statusMessage ? (
          <p className="text-primary mt-3 inline-flex items-center gap-2 text-sm">
            <IconCheck aria-hidden className="size-4" />
            <span>{statusMessage}</span>
          </p>
        ) : null}

        <form
          className="mt-4 grid gap-4 lg:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor={emailId}>Member Email</Label>
            <Input
              aria-describedby={emailError ? `${emailId}-error` : undefined}
              aria-invalid={emailError ? true : undefined}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className={cn(
                "min-h-11",
                emailError
                  ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                  : "",
              )}
              id={emailId}
              inputMode="email"
              name="invite_email"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="athlete@example.com…"
              ref={emailInputRef}
              spellCheck={false}
              type="email"
              value={form.email}
            />
            {emailError ? (
              <p className="text-destructive text-sm" id={`${emailId}-error`}>
                {emailError}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Use the email the member will register with.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={nameId}>Member Name (Optional)</Label>
            <Input
              autoComplete="name"
              className="min-h-11"
              id={nameId}
              name="invite_name"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Member Name…"
              type="text"
              value={form.name}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={roleId}>Role at Signup</Label>
            <Select
              id={roleId}
              items={roleOptions}
              name="invite_role"
              onValueChange={(role) => {
                if (role) {
                  setForm((prev) => ({ ...prev, role: role as ClientRole }));
                }
              }}
              value={form.role}
            >
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              {selectedRole?.description}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Role Default Status</span>
            <div className="has-focus-within bg-background rounded-lg border">
              <Label
                className="cursor-pointer items-start justify-between gap-4 p-3"
                htmlFor={statusId}
              >
                <span className="space-y-1">
                  <span className="block text-sm font-medium">
                    Apply Preassigned Role
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {form.isActive
                      ? "This role will be applied when the member first signs up."
                      : "This role is ignored; signup defaults to client."}
                  </span>
                </span>
                <input
                  checked={form.isActive}
                  className="accent-primary mt-0.5 size-5 shrink-0"
                  id={statusId}
                  name="invite_active"
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
              </Label>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 lg:col-span-2">
            <Button
              className="min-h-11"
              disabled={isSubmitting}
              onClick={() => {
                setForm(DEFAULT_FORM_STATE);
                setEmailError(null);
                setErrorMessage(null);
                setStatusMessage("");
                emailInputRef.current?.focus();
              }}
              type="button"
              variant="ghost"
            >
              Reset
            </Button>
            <Button
              className="min-h-11 min-w-36 touch-manipulation"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <IconLoader2 aria-hidden className="animate-spin" />
              ) : (
                <IconMailPlus aria-hidden />
              )}
              <span>Save Role Default</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
