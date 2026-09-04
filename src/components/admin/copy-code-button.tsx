"use client";

import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const COPIED_RESET_MS = 2000;

const iconTransition =
  "col-start-1 row-start-1 transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";

export function CopyCodeButton({
  className,
  code,
  size = "sm",
  variant = "outline",
}: {
  className?: string;
  code: string;
  size?: "default" | "sm";
  variant?: "default" | "outline";
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.add({
        description: code,
        timeout: COPIED_RESET_MS,
        title: "Copied to clipboard",
        type: "success",
      });
    } catch {
      toast.add({
        description: "Select the code and copy it manually.",
        priority: "high",
        timeout: 0,
        title: "Unable to copy",
        type: "error",
      });
    }
  };

  return (
    <Button
      aria-label={copied ? `Copied ${code}` : `Copy ${code}`}
      className={className}
      onClick={() => void copy()}
      size={size}
      type="button"
      variant={variant}
    >
      <span
        aria-hidden
        className="inline-grid place-items-center"
        data-icon="inline-start"
      >
        <IconCopy
          className={cn(
            iconTransition,
            copied ? "scale-25 opacity-0 blur-xs" : "scale-100 opacity-100",
          )}
        />
        <IconCheck
          className={cn(
            iconTransition,
            copied ? "scale-100 opacity-100" : "scale-25 opacity-0 blur-xs",
          )}
        />
      </span>
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
