import type { TooltipProps } from "@/components/ui/chart/combo-chart";
import { getColorClassName } from "@/lib/chart-utils";
import { formatDateRange } from "@/lib/race-dates";
import type {
  TrainingBlockChartColor,
  TrainingBlockChartContext,
} from "@/lib/training-blocks";
import { cn } from "@/lib/utils";

type TrainingBlockTimelineProps = {
  data: ReadonlyArray<TrainingBlockChartContext>;
  leftOffset?: number;
  rightOffset?: number;
};

type TimelineSegment = {
  color: TrainingBlockChartColor;
  endIndex: number;
  id: string;
  startIndex: number;
};

const getTimelineSegments = (
  data: ReadonlyArray<TrainingBlockChartContext>,
) => {
  const segments: TimelineSegment[] = [];
  let activeSegment: TimelineSegment | null = null;

  data.forEach((point, index) => {
    const blockId = point.trainingBlock?._id.toString();
    const isSameBlock = activeSegment?.id === blockId;

    if (activeSegment && isSameBlock) {
      activeSegment.endIndex = index;
      return;
    }

    if (activeSegment) segments.push(activeSegment);
    activeSegment =
      blockId && point.trainingBlockColor
        ? {
            color: point.trainingBlockColor,
            endIndex: index,
            id: blockId,
            startIndex: index,
          }
        : null;
  });

  if (activeSegment) segments.push(activeSegment);
  return segments;
};

const getSegmentPosition = (segment: TimelineSegment, dataLength: number) => {
  if (dataLength <= 1) return { left: 0, width: 100 };

  const intervals = dataLength - 1;
  const leftIndex = segment.startIndex === 0 ? 0 : segment.startIndex - 0.5;
  const rightIndex =
    segment.endIndex === dataLength - 1 ? intervals : segment.endIndex + 0.5;

  return {
    left: (leftIndex / intervals) * 100,
    width: ((rightIndex - leftIndex) / intervals) * 100,
  };
};

export function TrainingBlockTimeline({
  data,
  leftOffset = 0,
  rightOffset = 0,
}: TrainingBlockTimelineProps) {
  const segments = getTimelineSegments(data);

  if (segments.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-7 h-1.5 overflow-hidden rounded-sm"
      style={{ left: leftOffset, right: rightOffset }}
    >
      {segments.map((segment) => {
        const position = getSegmentPosition(segment, data.length);
        return (
          <span
            className={cn(
              "absolute inset-y-0",
              getColorClassName(segment.color, "bg"),
            )}
            key={`${segment.id}-${segment.startIndex}`}
            style={{ left: `${position.left}%`, width: `${position.width}%` }}
          />
        );
      })}
    </div>
  );
}

export const renderTrainingBlockTooltipContext = (
  payload: TooltipProps["payload"],
) => {
  const point = payload[0]?.payload as TrainingBlockChartContext | undefined;

  if (!point?.trainingBlock || !point.trainingBlockColor) {
    return <span>No training block</span>;
  }

  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn(
          "size-2 rounded-xs",
          getColorClassName(point.trainingBlockColor, "bg"),
        )}
      />
      <span>
        {point.trainingBlock.title} ·{" "}
        {formatDateRange(
          point.trainingBlock.startDate,
          point.trainingBlock.endDate,
        )}
      </span>
    </span>
  );
};
