import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  max?: number;
  renderLabel?: (progress: number) => number | string;
  size?: number;
  strokeWidth?: number;
  shape?: "square" | "round";
  className?: string;
  progressClassName?: string;
  labelClassName?: string;
  showLabel?: boolean;
}

const CircularProgress = ({
  value,
  max = 10,
  renderLabel,
  className,
  progressClassName,
  labelClassName,
  showLabel,
  shape = "round",
  size = 28,
  strokeWidth = 4,
}: CircularProgressProps) => {
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(value, max) / max);

  return (
    <div className="relative" style={{ height: size, width: size }}>
      <svg
        aria-hidden="true"
        className="absolute inset-0"
        style={{ transform: "rotate(-90deg)" }}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className={cn("stroke-primary/25", className)}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className={cn("stroke-primary", progressClassName)}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap={shape}
          strokeWidth={strokeWidth}
        />
      </svg>
      {showLabel && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center text-[10px] tabular-nums",
            labelClassName,
          )}
        >
          {renderLabel ? renderLabel(value) : value}
        </div>
      )}
    </div>
  );
};

export { CircularProgress };
