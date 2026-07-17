"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setPreviewRole } from "@/lib/auth/preview-actions";
import type { PreviewRole } from "@/lib/auth/preview-role";
import { cn } from "@/lib/utils";

interface PreviewRoleSwitchProps {
  className?: string;
  role: PreviewRole;
}

export function PreviewRoleSwitch({ className, role }: PreviewRoleSwitchProps) {
  const id = useId();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(role);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setSelectedRole(role), [role]);

  const handleRoleChange = (isAdmin: boolean) => {
    const nextRole = isAdmin ? "admin" : "client";
    setSelectedRole(nextRole);
    startTransition(async () => {
      await setPreviewRole(nextRole);
      router.refresh();
    });
  };

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-col">
        <label className="text-sm font-medium" htmlFor={id}>
          Admin mode
        </label>
        <span className="text-muted-foreground text-xs">
          Preview role: {selectedRole}
        </span>
      </div>
      <Switch
        aria-label="Use admin role in this preview"
        checked={selectedRole === "admin"}
        disabled={isPending}
        id={id}
        onCheckedChange={handleRoleChange}
      />
    </div>
  );
}
