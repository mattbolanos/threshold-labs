"use client";

import { useMutation } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useId, useOptimistic, useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { api } from "../../../convex/_generated/api";

export function PreviewAdminSwitch({ enabled }: { enabled: boolean }) {
  const id = useId();
  const pathname = usePathname();
  const router = useRouter();
  const setEnabled = useMutation(api.previewAdmin.setEnabled);
  const [selected, setSelected] = useOptimistic(enabled);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleChange = (checked: boolean) => {
    setError(null);
    startTransition(async () => {
      setSelected(checked);
      try {
        await setEnabled({ enabled: checked });
        if (
          !checked &&
          (pathname === "/lab/admin" || pathname.startsWith("/lab/admin/"))
        ) {
          router.replace("/lab/lab-notes");
        }
        router.refresh();
      } catch {
        setError("Could not change admin access. Try again.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-1 px-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <label className="text-sm font-medium" htmlFor={id}>
            Impersonate admin
          </label>
          <span
            className="text-xs text-muted-foreground"
            id={`${id}-description`}
          >
            {selected ? "Admin access for this session" : "Vercel preview only"}
          </span>
        </div>
        <Switch
          aria-describedby={`${id}-description`}
          checked={selected}
          disabled={isPending}
          id={id}
          onCheckedChange={handleChange}
        />
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
