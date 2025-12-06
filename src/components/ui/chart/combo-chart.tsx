// biome-ignore-all lint/suspicious/noExplicitAny: <tremor>

"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React from "react";
import {
  Bar,
  CartesianGrid,
  Dot,
  Label,
  Line,
  ComposedChart as RechartsComposedChart,
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AxisDomain } from "recharts/types/util/types";
import { useOnWindowResize } from "@/hooks/use-on-window-resize";
import {
  AvailableChartColors,
  type AvailableChartColorsKeys,
  constructCategoryColors,
  getColorClassName,
  getYAxisDomain,
  hasOnlyOneValueForKey,
} from "@/lib/chart-utils";
import { cn } from "@/lib/utils";

//#region Shape
function deepEqual<T>(obj1: T, obj2: T): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1) as Array<keyof T>;
  const keys2 = Object.keys(obj2) as Array<keyof T>;

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

const renderShape = (
  props: any,
  activeBar: any | undefined,
  activeLegend: string | undefined,
) => {
  const { fillOpacity, name, payload, value, width, x } = props;
  let { y, height } = props;

  if (height < 0) {
    y += height;
    height = Math.abs(height); // height must be a positive number
  }

  return (
    <rect
      height={height}
      opacity={
        activeBar || (activeLegend && activeLegend !== name)
          ? deepEqual(activeBar, { ...payload, value })
            ? fillOpacity
            : 0.3
          : fillOpacity
      }
      width={width}
      x={x}
      y={y}
    />
  );
};

//#region Legend

interface LegendItemProps {
  name: string;
  label: string;
  color?: AvailableChartColorsKeys;
  onClick?: (name: string, color: AvailableChartColorsKeys) => void;
  activeLegend?: string;
  chartType: "bar" | "line";
}

const LegendItem = ({
  name,
  label,
  color = "chart-1",
  onClick,
  activeLegend,
  chartType,
}: LegendItemProps) => {
  const hasOnValueChange = !!onClick;
  const colorClass = getColorClassName(color, "bg");

  return (
    <li
      className={cn(
        // base
        "group inline-flex flex-nowrap items-center gap-1.5 rounded-sm px-2 py-1 whitespace-nowrap transition",
        hasOnValueChange
          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          : "cursor-default",
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(name, color);
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        onClick?.(name, color);
      }}
    >
      <span
        aria-hidden={true}
        className={cn(
          { "size-2.5 rounded-xs": chartType === "bar" },
          {
            "h-1 w-4 shrink-0 rounded-full": chartType === "line",
          },
          "shrink-0",
          colorClass,
          activeLegend && activeLegend !== name ? "opacity-40" : "opacity-100",
        )}
      />
      <p
        className={cn(
          // base
          "truncate text-xs whitespace-nowrap",
          // text color
          "text-gray-700 dark:text-gray-300",
          hasOnValueChange &&
            "group-hover:text-gray-900 dark:group-hover:text-gray-50",
          activeLegend && activeLegend !== name ? "opacity-40" : "opacity-100",
        )}
      >
        {label}
      </p>
    </li>
  );
};

interface ScrollButtonProps {
  icon: React.ElementType;
  onClick?: () => void;
  disabled?: boolean;
}

const ScrollButton = ({ icon, onClick, disabled }: ScrollButtonProps) => {
  const Icon = icon;
  const [isPressed, setIsPressed] = React.useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isPressed) {
      intervalRef.current = setInterval(() => {
        onClick?.();
      }, 300);
    } else {
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isPressed, onClick]);

  React.useEffect(() => {
    if (disabled) {
      clearInterval(intervalRef.current as NodeJS.Timeout);
      setIsPressed(false);
    }
  }, [disabled]);

  return (
    <button
      className={cn(
        // base
        "group inline-flex size-5 items-center truncate rounded-sm transition",
        disabled
          ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
          : "cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50",
      )}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        setIsPressed(true);
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        setIsPressed(false);
      }}
      type="button"
    >
      <Icon aria-hidden="true" className="size-full" />
    </button>
  );
};

interface LegendProps extends React.OlHTMLAttributes<HTMLOListElement> {
  categories: { name: string; label?: string; chartType: "bar" | "line" }[];
  barCategoryColors: Map<string, AvailableChartColorsKeys>;
  lineCategoryColors: Map<string, AvailableChartColorsKeys>;
  onClickLegendItem?: (
    category: string,
    color: AvailableChartColorsKeys,
  ) => void;
  activeLegend?: string;
  enableLegendSlider?: boolean;
}

type HasScrollProps = {
  left: boolean;
  right: boolean;
};

const Legend = React.forwardRef<HTMLOListElement, LegendProps>((props, ref) => {
  const {
    categories,
    barCategoryColors,
    lineCategoryColors,
    onClickLegendItem,
    activeLegend,
    enableLegendSlider = false,
    className,
    ...other
  } = props;
  const scrollableRef = React.useRef<HTMLInputElement>(null);
  const [hasScroll, setHasScroll] = React.useState<HasScrollProps | null>(null);
  const [isKeyDowned, setIsKeyDowned] = React.useState<string | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const checkScroll = React.useCallback(() => {
    const scrollable = scrollableRef?.current;
    if (!scrollable) return;

    const hasLeftScroll = scrollable.scrollLeft > 0;
    const hasRightScroll =
      scrollable.scrollWidth - scrollable.clientWidth > scrollable.scrollLeft;

    setHasScroll({ left: hasLeftScroll, right: hasRightScroll });
  }, []);

  const scrollToTest = React.useCallback(
    (direction: "left" | "right") => {
      const element = scrollableRef?.current;
      const width = element?.clientWidth ?? 0;

      if (element && enableLegendSlider) {
        element.scrollTo({
          behavior: "smooth",
          left:
            direction === "left"
              ? element.scrollLeft - width
              : element.scrollLeft + width,
        });
        setTimeout(() => {
          checkScroll();
        }, 400);
      }
    },
    [enableLegendSlider, checkScroll],
  );

  React.useEffect(() => {
    const keyDownHandler = (key: string) => {
      if (key === "ArrowLeft") {
        scrollToTest("left");
      } else if (key === "ArrowRight") {
        scrollToTest("right");
      }
    };
    if (isKeyDowned) {
      keyDownHandler(isKeyDowned);
      intervalRef.current = setInterval(() => {
        keyDownHandler(isKeyDowned);
      }, 300);
    } else {
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isKeyDowned, scrollToTest]);

  const keyDown = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      setIsKeyDowned(e.key);
    }
  };
  const keyUp = (e: KeyboardEvent) => {
    e.stopPropagation();
    setIsKeyDowned(null);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <tremor>
  React.useEffect(() => {
    const scrollable = scrollableRef?.current;
    if (enableLegendSlider) {
      checkScroll();
      scrollable?.addEventListener("keydown", keyDown);
      scrollable?.addEventListener("keyup", keyUp);
    }

    return () => {
      scrollable?.removeEventListener("keydown", keyDown);
      scrollable?.removeEventListener("keyup", keyUp);
    };
  }, [checkScroll, enableLegendSlider]);

  return (
    <ol
      className={cn("relative overflow-hidden", className)}
      ref={ref}
      {...other}
    >
      <div
        className={cn(
          "flex h-full",
          enableLegendSlider
            ? hasScroll?.right || hasScroll?.left
              ? "snap-mandatory items-center overflow-auto pr-12 pl-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : ""
            : "flex-wrap",
        )}
        ref={scrollableRef}
      >
        {categories.map((category, index) => {
          const barColor = barCategoryColors.get(category.name);
          const lineColor = lineCategoryColors.get(category.name);
          return (
            <LegendItem
              activeLegend={activeLegend}
              chartType={category.chartType}
              color={category.chartType === "bar" ? barColor : lineColor}
              // biome-ignore lint/suspicious/noArrayIndexKey: <tremor>
              key={`item-${index}`}
              label={category.label ?? category.name}
              name={category.name}
              onClick={onClickLegendItem}
            />
          );
        })}
      </div>
      {enableLegendSlider && (hasScroll?.right || hasScroll?.left) ? (
        <div
          className={cn(
            // base
            "absolute top-0 right-0 bottom-0 flex h-full items-center justify-center pr-1",
            // background color
            "bg-card",
          )}
        >
          <ScrollButton
            disabled={!hasScroll?.left}
            icon={IconChevronLeft}
            onClick={() => {
              setIsKeyDowned(null);
              scrollToTest("left");
            }}
          />
          <ScrollButton
            disabled={!hasScroll?.right}
            icon={IconChevronRight}
            onClick={() => {
              setIsKeyDowned(null);
              scrollToTest("right");
            }}
          />
        </div>
      ) : null}
    </ol>
  );
});

Legend.displayName = "Legend";

const ChartLegend = (
  { payload }: any,
  barCategoryColors: Map<string, AvailableChartColorsKeys>,
  lineCategoryColors: Map<string, AvailableChartColorsKeys>,
  setLegendHeight: React.Dispatch<React.SetStateAction<number>>,
  activeLegend: string | undefined,
  onClick?: (category: string, color: AvailableChartColorsKeys) => void,
  enableLegendSlider?: boolean,
  legendPosition?: "left" | "center" | "right",
  lineYAxisWidth?: number,
  barCategoryLabelMap?: Map<string, string>,
  lineCategoryLabelMap?: Map<string, string>,
) => {
  // biome-ignore lint/correctness/useHookAtTopLevel: <tremor>
  const legendRef = React.useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useHookAtTopLevel: <tremor>
  useOnWindowResize(() => {
    const calculateHeight = (height: number | undefined) =>
      height ? Number(height) + 15 : 60;
    setLegendHeight(calculateHeight(legendRef.current?.clientHeight));
  });

  const filteredPayload = payload.filter((item: any) => item.type !== "none");

  const legendItems = filteredPayload.map((entry: any) => {
    const dataKey = entry.dataKey as string;
    const isBar = entry.type === "rect" || barCategoryColors.has(dataKey);
    const chartType: "bar" | "line" = isBar ? "bar" : "line";
    const label =
      (chartType === "bar"
        ? barCategoryLabelMap?.get(dataKey)
        : lineCategoryLabelMap?.get(dataKey)) ?? entry.value;

    return {
      chartType,
      label,
      name: dataKey,
    };
  });

  const paddingRight =
    (legendPosition === "right" || legendPosition === undefined) &&
    lineYAxisWidth
      ? lineYAxisWidth - 8
      : 52;

  return (
    <div
      className={cn(
        "flex items-center",
        { "justify-center": legendPosition === "center" },
        {
          "justify-start pl-1.5": legendPosition === "left",
        },
        { "justify-end": legendPosition === "right" },
      )}
      ref={legendRef}
      style={{ paddingRight: paddingRight }}
    >
      <Legend
        activeLegend={activeLegend}
        barCategoryColors={barCategoryColors}
        categories={legendItems}
        enableLegendSlider={enableLegendSlider}
        lineCategoryColors={lineCategoryColors}
        onClickLegendItem={onClick}
      />
    </div>
  );
};

//#region Tooltip

type TooltipProps = Pick<ChartTooltipProps, "active" | "payload" | "label">;

type PayloadItem = {
  category: string;
  value: number;
  index: string;
  barColor: AvailableChartColorsKeys;
  lineColor: AvailableChartColorsKeys;
  chartType: "bar" | "line";
  dataKey: string;
  type: string;
  payload: any;
};

interface ChartTooltipProps {
  active: boolean | undefined;
  payload: PayloadItem[];
  label: string;
  labelFormatter?: (label: string) => string;
  barValueFormatter?: (value: number) => string;
  lineValueFormatter?: (value: number) => string;
}

const ChartTooltip = ({
  active,
  payload,
  label,
  labelFormatter,
  barValueFormatter = (value: number): string => value.toString(),
  lineValueFormatter = (value: number): string => value.toString(),
}: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const filteredPayload = payload.filter((item: any) => item.type !== "none");
    return (
      <div
        className={cn(
          // base
          "rounded-md border text-sm shadow-md",
          // border color
          "border-gray-200 dark:border-gray-800",
          // background color
          "bg-card",
        )}
      >
        <div className={cn("border-b border-inherit px-4 py-2")}>
          <p
            className={cn(
              // base
              "font-medium",
              // text color
              "text-gray-900 dark:text-gray-50",
            )}
          >
            {labelFormatter ? labelFormatter(label) : label}
          </p>
        </div>
        <div className={cn("space-y-1 px-4 py-2")}>
          {filteredPayload.map(
            ({ value, category, barColor, lineColor, chartType }, index) => (
              <div
                className="flex items-center justify-between space-x-8"
                // biome-ignore lint/suspicious/noArrayIndexKey: <tremor>
                key={`id-${index}`}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex w-5 items-center justify-center">
                    <span
                      aria-hidden="true"
                      className={cn(
                        { "size-3 rounded-xs": chartType === "bar" },
                        {
                          "h-1 w-3.5 shrink-0 rounded-full":
                            chartType === "line",
                        },
                        "shrink-0",
                        getColorClassName(
                          chartType === "bar" ? barColor : lineColor,
                          "bg",
                        ),
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      // base
                      "text-right whitespace-nowrap",
                      // text color
                      "text-gray-700 dark:text-gray-300",
                    )}
                  >
                    {category}
                  </p>
                </div>
                <p
                  className={cn(
                    // base
                    "text-right font-medium whitespace-nowrap tabular-nums",
                    // text color
                    "text-gray-900 dark:text-gray-50",
                  )}
                >
                  {chartType === "bar"
                    ? barValueFormatter(value)
                    : lineValueFormatter(value)}
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    );
  }
  return null;
};

interface ActiveDot {
  index?: number;
  dataKey?: string;
}

type BaseEventProps = {
  eventType: "category" | "bar" | "dot";
  categoryClicked: string;
  [key: string]: number | string;
};

type ComboChartEventProps = BaseEventProps | null | undefined;

type ChartSeries = {
  categories: string[];
  categoryLabels?: Partial<Record<string, string>>;
  colors?: AvailableChartColorsKeys[];
  valueFormatter?: (value: number) => string;
  showYAxis?: boolean;
  yAxisWidth?: number;
  allowDecimals?: boolean;
  yAxisLabel?: string;
  autoMinValue?: boolean;
  minValue?: number;
  maxValue?: number;
};

interface ComboChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[];
  index: string;
  startEndOnly?: boolean;
  showXAxis?: boolean;
  xTicksFormatter?: (value: number | string) => string;
  xAxisLabel?: string;
  showGridLines?: boolean;
  intervalType?: "preserveStartEnd" | "equidistantPreserveStart";
  showLegend?: boolean;
  showTooltip?: boolean;
  onValueChange?: (value: ComboChartEventProps) => void;
  enableLegendSlider?: boolean;
  legendPosition?: "left" | "center" | "right";
  tickGap?: number;
  enableBiaxial?: boolean;
  tooltipCallback?: (tooltipCallbackContent: TooltipProps) => void;
  customTooltip?: React.ComponentType<TooltipProps>;
  barSeries: ChartSeries & {
    type?: "default" | "stacked";
  };
  lineSeries?: ChartSeries & {
    connectNulls?: boolean;
  };
  tooltipLabelFormatter?: (label: string) => string;
}

const ComboChart = React.forwardRef<HTMLDivElement, ComboChartProps>(
  (props, forwardedRef) => {
    const defaultSeries = {
      allowDecimals: true,
      autoMinValue: false,
      categories: [],
      categoryLabels: undefined,
      colors: AvailableChartColors,
      maxValue: undefined,
      minValue: undefined,
      showYAxis: true,
      tooltipLabelFormatter: undefined,
      type: "default",
      valueFormatter: (value: number) => value.toString(),
      xTicksFormatter: undefined,
      yAxisLabel: undefined,
      yAxisWidth: 56,
    };

    const defaultBarSeries = defaultSeries;
    const defaultLineSeries = {
      ...defaultSeries,
      connectNulls: false,
    };

    const {
      data = [],
      index,
      startEndOnly = false,
      showXAxis = true,
      showGridLines = true,
      intervalType = "equidistantPreserveStart",
      showTooltip = true,
      showLegend = true,
      legendPosition = "right",
      enableLegendSlider = false,
      onValueChange,
      tickGap = 5,
      xAxisLabel,
      enableBiaxial = false,
      tooltipLabelFormatter,
      xTicksFormatter,
      barSeries = defaultBarSeries,
      lineSeries = defaultLineSeries,
      tooltipCallback,
      customTooltip,

      className,
      ...other
    } = props;
    const mergedBarSeries = { ...defaultBarSeries, ...barSeries };
    const mergedLineSeries = { ...defaultLineSeries, ...lineSeries };

    const CustomTooltip = customTooltip;

    const paddingValue =
      (!showXAxis &&
        !mergedBarSeries.showYAxis &&
        enableBiaxial &&
        !mergedLineSeries.showYAxis) ||
      (startEndOnly &&
        !mergedBarSeries.showYAxis &&
        enableBiaxial &&
        !mergedLineSeries.showYAxis)
        ? 0
        : 20;
    const [legendHeight, setLegendHeight] = React.useState(60);
    const [activeDot, setActiveDot] = React.useState<ActiveDot | undefined>(
      undefined,
    );
    const [activeLegend, setActiveLegend] = React.useState<string | undefined>(
      undefined,
    );

    const prevActiveRef = React.useRef<boolean | undefined>(undefined);
    const prevLabelRef = React.useRef<string | undefined>(undefined);

    const barCategoryColors = constructCategoryColors(
      mergedBarSeries.categories,
      mergedBarSeries.colors ?? AvailableChartColors,
    );
    const lineCategoryColors = constructCategoryColors(
      mergedLineSeries.categories,
      mergedLineSeries.colors ?? AvailableChartColors,
    );
    const barCategoryLabelMap = React.useMemo(() => {
      const map = new Map<string, string>();
      mergedBarSeries.categories.forEach((category) => {
        map.set(
          category,
          mergedBarSeries.categoryLabels?.[category] ?? category,
        );
      });
      return map;
    }, [mergedBarSeries.categories, mergedBarSeries.categoryLabels]);
    const lineCategoryLabelMap = React.useMemo(() => {
      const map = new Map<string, string>();
      mergedLineSeries.categories.forEach((category) => {
        map.set(
          category,
          mergedLineSeries.categoryLabels?.[category] ?? category,
        );
      });
      return map;
    }, [mergedLineSeries.categories, mergedLineSeries.categoryLabels]);
    const [activeBar, setActiveBar] = React.useState<any | undefined>(
      undefined,
    );
    const barYAxisDomain = getYAxisDomain(
      mergedBarSeries.autoMinValue ?? false,
      mergedBarSeries.minValue,
      mergedBarSeries.maxValue,
    );
    const lineYAxisDomain = getYAxisDomain(
      mergedLineSeries.autoMinValue ?? false,
      mergedLineSeries.minValue,
      mergedLineSeries.maxValue,
    );
    const hasOnValueChange = !!onValueChange;
    const stacked = barSeries.type === "stacked";

    function onBarClick(data: any, _: any, event: React.MouseEvent) {
      event.stopPropagation();
      if (!onValueChange) return;
      if (deepEqual(activeBar, { ...data.payload, value: data.value })) {
        setActiveLegend(undefined);
        setActiveBar(undefined);
        onValueChange?.(null);
      } else {
        setActiveLegend(data.tooltipPayload?.[0]?.dataKey);
        setActiveBar({
          ...data.payload,
          value: data.value,
        });
        onValueChange?.({
          categoryClicked: data.tooltipPayload?.[0]?.dataKey,
          eventType: "bar",
          ...data.payload,
        });
      }
    }

    function onDotClick(itemData: any, event: React.MouseEvent) {
      event.stopPropagation();

      if (!hasOnValueChange) return;
      if (
        (itemData.index === activeDot?.index &&
          itemData.dataKey === activeDot?.dataKey) ||
        (hasOnlyOneValueForKey(data, itemData.dataKey) &&
          activeLegend &&
          activeLegend === itemData.dataKey)
      ) {
        setActiveLegend(undefined);
        setActiveDot(undefined);
        onValueChange?.(null);
      } else {
        setActiveBar(undefined);
        setActiveLegend(itemData.dataKey);
        setActiveDot({
          dataKey: itemData.dataKey,
          index: itemData.index,
        });
        onValueChange?.({
          categoryClicked: itemData.dataKey,
          eventType: "dot",
          ...itemData.payload,
        });
      }
    }

    function onCategoryClick(dataKey: string) {
      if (!hasOnValueChange) return;

      if (dataKey === activeLegend && !activeBar && !activeDot) {
        setActiveLegend(undefined);
        onValueChange?.(null);
      } else if (
        activeBar &&
        activeBar.tooltipPayload?.[0]?.dataKey === dataKey
      ) {
        setActiveLegend(dataKey);
        onValueChange?.({
          categoryClicked: dataKey,
          eventType: "category",
        });
      } else {
        setActiveLegend(dataKey);
        setActiveBar(undefined);
        setActiveDot(undefined);
        onValueChange?.({
          categoryClicked: dataKey,
          eventType: "category",
        });
      }
    }

    return (
      <div
        className={cn("h-64 w-full sm:h-80", className)}
        ref={forwardedRef}
        tremor-id="tremor-raw"
        {...other}
      >
        <ResponsiveContainer debounce={300}>
          <RechartsComposedChart
            data={data}
            margin={{
              bottom: xAxisLabel ? 30 : undefined,
              left: mergedBarSeries.yAxisLabel ? 20 : undefined,
              right: mergedLineSeries.yAxisLabel ? 20 : undefined,
              top: 5,
            }}
            onClick={
              hasOnValueChange && (activeLegend || activeBar || activeDot)
                ? () => {
                    setActiveBar(undefined);
                    setActiveDot(undefined);
                    setActiveLegend(undefined);
                    onValueChange?.(null);
                  }
                : undefined
            }
          >
            {showGridLines ? (
              <CartesianGrid
                className={cn("stroke-gray-200 stroke-1 dark:stroke-gray-800")}
                horizontal={true}
                vertical={false}
                yAxisId={enableBiaxial ? "left" : undefined}
              />
            ) : null}
            <XAxis
              axisLine={false}
              className={cn(
                // base
                "mt-3 text-xs",
                // text fill
                "fill-gray-500 dark:fill-gray-500",
              )}
              dataKey={index}
              fill=""
              hide={!showXAxis}
              interval={startEndOnly ? "preserveStartEnd" : intervalType}
              minTickGap={tickGap}
              padding={{
                left: paddingValue,
                right: paddingValue,
              }}
              stroke=""
              tick={{
                transform: "translate(0, 6)",
              }}
              tickFormatter={xTicksFormatter ? xTicksFormatter : undefined}
              tickLine={false}
              ticks={
                startEndOnly
                  ? [data[0][index], data[data.length - 1][index]]
                  : undefined
              }
            >
              {xAxisLabel && (
                <Label
                  className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                  offset={-20}
                  position="insideBottom"
                >
                  {xAxisLabel}
                </Label>
              )}
            </XAxis>
            <YAxis
              allowDecimals={mergedBarSeries.allowDecimals}
              axisLine={false}
              className={cn(
                // base
                "text-xs",
                // text fill
                "fill-gray-500 dark:fill-gray-500",
              )}
              domain={barYAxisDomain as AxisDomain}
              fill=""
              hide={!mergedBarSeries.showYAxis}
              stroke=""
              tick={{
                transform: "translate(-3, 0)",
              }}
              tickFormatter={mergedBarSeries.valueFormatter}
              tickLine={false}
              type="number"
              width={mergedBarSeries.yAxisWidth}
              yAxisId={enableBiaxial ? "left" : undefined}
            >
              {mergedBarSeries.yAxisLabel && (
                <Label
                  angle={-90}
                  className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                  offset={-15}
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                >
                  {mergedBarSeries.yAxisLabel}
                </Label>
              )}
            </YAxis>

            {enableBiaxial ? (
              <YAxis
                allowDecimals={mergedLineSeries.allowDecimals}
                axisLine={false}
                className={cn(
                  // base
                  "text-xs",
                  // text fill
                  "fill-gray-500 dark:fill-gray-500",
                )}
                domain={lineYAxisDomain as AxisDomain}
                fill=""
                hide={!mergedLineSeries.showYAxis}
                orientation="right"
                stroke=""
                tick={{
                  transform: "translate(3, 0)",
                }}
                tickFormatter={mergedLineSeries.valueFormatter}
                tickLine={false}
                type="number"
                width={mergedLineSeries.yAxisWidth}
                yAxisId="right"
              >
                {mergedLineSeries.yAxisLabel && (
                  <Label
                    angle={-90}
                    className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                    offset={-15}
                    position="insideRight"
                    style={{ textAnchor: "middle" }}
                  >
                    {mergedLineSeries.yAxisLabel}
                  </Label>
                )}
              </YAxis>
            ) : null}
            {showLegend ? (
              <RechartsLegend
                content={({ payload }) =>
                  ChartLegend(
                    { payload },
                    barCategoryColors,
                    lineCategoryColors,
                    setLegendHeight,
                    activeLegend,
                    hasOnValueChange
                      ? (clickedLegendItem: string) =>
                          onCategoryClick(clickedLegendItem)
                      : undefined,
                    enableLegendSlider,
                    legendPosition,
                    mergedLineSeries.yAxisWidth,
                    barCategoryLabelMap,
                    lineCategoryLabelMap,
                  )
                }
                height={legendHeight}
                verticalAlign="top"
              />
            ) : null}
            <Tooltip
              animationDuration={100}
              content={({ active, payload, label }) => {
                const cleanPayload: TooltipProps["payload"] = payload
                  ? payload.map((item: any) => ({
                      barColor: barCategoryColors.get(
                        item.dataKey,
                      ) as AvailableChartColorsKeys,
                      category:
                        (barCategoryColors.has(item.dataKey)
                          ? barCategoryLabelMap?.get(item.dataKey)
                          : lineCategoryLabelMap?.get(item.dataKey)) ??
                        item.dataKey,
                      chartType: barCategoryColors.has(item.dataKey)
                        ? "bar"
                        : ("line" as PayloadItem["chartType"]),
                      dataKey: item.dataKey,
                      index: item.payload[index],
                      lineColor: lineCategoryColors.get(
                        item.dataKey,
                      ) as AvailableChartColorsKeys,
                      payload: item.payload,
                      type: item.type,
                      value: item.value,
                    }))
                  : [];

                if (
                  tooltipCallback &&
                  typeof label === "string" &&
                  (active !== prevActiveRef.current ||
                    label !== prevLabelRef.current)
                ) {
                  tooltipCallback({ active, label, payload: cleanPayload });
                  prevActiveRef.current = active;
                  prevLabelRef.current = label;
                }

                return showTooltip && active ? (
                  CustomTooltip ? (
                    <CustomTooltip
                      active={active}
                      label={label as string}
                      payload={cleanPayload}
                    />
                  ) : (
                    <ChartTooltip
                      active={active}
                      barValueFormatter={mergedBarSeries.valueFormatter}
                      label={label as string}
                      labelFormatter={tooltipLabelFormatter}
                      lineValueFormatter={mergedLineSeries.valueFormatter}
                      payload={cleanPayload}
                    />
                  )
                ) : null;
              }}
              cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
              isAnimationActive={true}
              offset={20}
              position={{
                y: 0,
              }}
              wrapperStyle={{ outline: "none" }}
            />

            {mergedBarSeries.categories.map((category) => (
              <Bar
                className={cn(
                  getColorClassName(
                    barCategoryColors.get(category) as AvailableChartColorsKeys,
                    "fill",
                  ),
                  onValueChange ? "cursor-pointer" : "",
                )}
                dataKey={category}
                fill=""
                isAnimationActive={false}
                key={category}
                name={category}
                onClick={onBarClick}
                shape={(props: any) =>
                  renderShape(props, activeBar, activeLegend)
                }
                stackId={stacked ? "stack" : undefined}
                type="linear"
                yAxisId={enableBiaxial ? "left" : undefined}
              />
            ))}
            {/* hidden lines to increase clickable target area */}
            {onValueChange
              ? mergedLineSeries.categories.map((category) => (
                  <Line
                    className={cn("cursor-pointer")}
                    connectNulls={mergedLineSeries.connectNulls}
                    dataKey={category}
                    fill="transparent"
                    key={category}
                    legendType="none"
                    name={category}
                    onClick={(props: any, event) => {
                      event.stopPropagation();
                      const { name } = props;
                      onCategoryClick(name);
                    }}
                    stroke="transparent"
                    strokeOpacity={0}
                    strokeWidth={12}
                    tooltipType="none"
                    type="monotone"
                    yAxisId={enableBiaxial ? "right" : undefined}
                  />
                ))
              : null}
            {mergedLineSeries.categories.map((category) => (
              <Line
                activeDot={(props: any) => {
                  const {
                    cx: cxCoord,
                    cy: cyCoord,
                    stroke,
                    strokeLinecap,
                    strokeLinejoin,
                    strokeWidth,
                    dataKey,
                  } = props;
                  return (
                    <Dot
                      className={cn(
                        "stroke-white dark:stroke-gray-950",
                        onValueChange ? "cursor-pointer" : "",
                        getColorClassName(
                          lineCategoryColors.get(
                            dataKey,
                          ) as AvailableChartColorsKeys,
                          "fill",
                        ),
                      )}
                      cx={cxCoord}
                      cy={cyCoord}
                      fill=""
                      onClick={(_, event) => onDotClick(props, event)}
                      r={5}
                      stroke={stroke}
                      strokeLinecap={strokeLinecap}
                      strokeLinejoin={strokeLinejoin}
                      strokeWidth={strokeWidth}
                    />
                  );
                }}
                animationDuration={700}
                animationEasing="ease-in"
                className={cn(
                  getColorClassName(
                    lineCategoryColors.get(
                      category,
                    ) as AvailableChartColorsKeys,
                    "stroke",
                  ),
                  hasOnValueChange && "cursor-pointer",
                )}
                connectNulls={mergedLineSeries.connectNulls}
                dataKey={category}
                dot={(props: any) => {
                  const {
                    stroke,
                    strokeLinecap,
                    strokeLinejoin,
                    strokeWidth,
                    cx: cxCoord,
                    cy: cyCoord,
                    dataKey,
                    index,
                  } = props;

                  if (
                    (hasOnlyOneValueForKey(data, category) &&
                      !(
                        activeDot ||
                        (activeLegend && activeLegend !== category)
                      )) ||
                    (activeDot?.index === index &&
                      activeDot?.dataKey === category)
                  ) {
                    return (
                      <Dot
                        className={cn(
                          "stroke-white dark:stroke-gray-950",
                          onValueChange ? "cursor-pointer" : "",
                          getColorClassName(
                            lineCategoryColors.get(
                              dataKey,
                            ) as AvailableChartColorsKeys,
                            "fill",
                          ),
                        )}
                        cx={cxCoord}
                        cy={cyCoord}
                        fill=""
                        key={index}
                        r={5}
                        stroke={stroke}
                        strokeLinecap={strokeLinecap}
                        strokeLinejoin={strokeLinejoin}
                        strokeWidth={strokeWidth}
                      />
                    );
                  }
                  return <React.Fragment key={index}></React.Fragment>;
                }}
                isAnimationActive={true}
                key={`${category}-line-id`}
                name={category}
                onClick={(props: any, event) => {
                  event.stopPropagation();
                  const { name } = props;
                  onCategoryClick(name);
                }}
                stroke=""
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={
                  activeDot || (activeLegend && activeLegend !== category)
                    ? 0.3
                    : 1
                }
                strokeWidth={3}
                type="monotone"
                yAxisId={enableBiaxial ? "right" : undefined}
              />
            ))}
          </RechartsComposedChart>
        </ResponsiveContainer>
      </div>
    );
  },
);

ComboChart.displayName = "ComboChart";

export { ComboChart, type ComboChartEventProps, type TooltipProps };
