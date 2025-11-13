// biome-ignore-all lint/suspicious/noExplicitAny: <tremor>

"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";
import {
  Bar,
  CartesianGrid,
  Label,
  BarChart as RechartsBarChart,
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
  layout: string,
) => {
  const { fillOpacity, name, payload, value } = props;
  let { x, width, y, height } = props;

  if (layout === "horizontal" && height < 0) {
    y += height;
    height = Math.abs(height); // height must be a positive number
  } else if (layout === "vertical" && width < 0) {
    x += width;
    width = Math.abs(width); // width must be a positive number
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
  label: string;
  dataKey: string;
  color: AvailableChartColorsKeys;
  onClick?: (dataKey: string, color: AvailableChartColorsKeys) => void;
  activeLegend?: string;
}

const LegendItem = ({
  label,
  dataKey,
  color,
  onClick,
  activeLegend,
}: LegendItemProps) => {
  const hasOnValueChange = !!onClick;
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
        onClick?.(dataKey, color);
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        onClick?.(dataKey, color);
      }}
    >
      <span
        aria-hidden={true}
        className={cn(
          "size-2 shrink-0 rounded-xs",
          getColorClassName(color, "bg"),
          activeLegend && activeLegend !== dataKey
            ? "opacity-40"
            : "opacity-100",
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
          activeLegend && activeLegend !== dataKey
            ? "opacity-40"
            : "opacity-100",
        )}
      >
        {label}
      </p>
    </li>
  );
};

type ScrollButtonProps = {
  icon: React.ElementType;
  onClick?: () => void;
  disabled?: boolean;
};

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

type LegendEntry = {
  dataKey: string;
  label: string;
  color: AvailableChartColorsKeys;
};

interface LegendProps extends React.OlHTMLAttributes<HTMLOListElement> {
  items: LegendEntry[];
  onClickLegendItem?: (category: string, color: string) => void;
  activeLegend?: string;
  enableLegendSlider?: boolean;
  chartTitle?: string;
}

type HasScrollProps = {
  left: boolean;
  right: boolean;
};

const Legend = React.forwardRef<HTMLOListElement, LegendProps>((props, ref) => {
  const {
    items,
    chartTitle,
    className,
    onClickLegendItem,
    activeLegend,
    enableLegendSlider = false,
    ...other
  } = props;
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const scrollButtonsRef = React.useRef<HTMLDivElement>(null);
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
      const scrollButtons = scrollButtonsRef?.current;
      const scrollButtonsWith = scrollButtons?.clientWidth ?? 0;
      const width = element?.clientWidth ?? 0;

      if (element && enableLegendSlider) {
        element.scrollTo({
          behavior: "smooth",
          left:
            direction === "left"
              ? element.scrollLeft - width + scrollButtonsWith
              : element.scrollLeft + width - scrollButtonsWith,
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
    <div className="mb-2 flex w-full flex-col items-start justify-start">
      {chartTitle && (
        <div className="text-muted-foreground pl-6 text-left text-lg font-medium">
          {chartTitle}
        </div>
      )}
      <ol
        className={cn("relative overflow-hidden pl-4.5", className)}
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
          // biome-ignore lint/a11y/noNoninteractiveTabindex: <tremor>
          tabIndex={0}
        >
          {items.map(({ dataKey, label, color }) => (
            <LegendItem
              activeLegend={activeLegend}
              color={color}
              dataKey={dataKey}
              key={`item-${dataKey}`}
              label={label}
              onClick={onClickLegendItem}
            />
          ))}
        </div>
        {enableLegendSlider && (hasScroll?.right || hasScroll?.left) ? (
          <div
            className={cn(
              // base
              "absolute top-0 right-0 bottom-0 flex h-full items-center justify-center pr-1",
              // background color
              "bg-white dark:bg-gray-950",
            )}
          >
            <ScrollButton
              disabled={!hasScroll?.left}
              icon={ChevronLeftIcon}
              onClick={() => {
                setIsKeyDowned(null);
                scrollToTest("left");
              }}
            />
            <ScrollButton
              disabled={!hasScroll?.right}
              icon={ChevronRightIcon}
              onClick={() => {
                setIsKeyDowned(null);
                scrollToTest("right");
              }}
            />
          </div>
        ) : null}
      </ol>
    </div>
  );
});

Legend.displayName = "Legend";

const ChartLegend = (
  { payload }: any,
  categoryColors: Map<string, AvailableChartColorsKeys>,
  setLegendHeight: React.Dispatch<React.SetStateAction<number>>,
  activeLegend: string | undefined,
  chartTitle?: string,
  onClick?: (category: string, color: string) => void,
  enableLegendSlider?: boolean,
  legendPosition?: "left" | "center" | "right",
  yAxisWidth?: number,
  categoryLabelMap?: Map<string, string>,
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
    const color = categoryColors.get(dataKey) as AvailableChartColorsKeys;

    return {
      color,
      dataKey,
      label: categoryLabelMap?.get(dataKey) ?? entry.value,
    };
  });

  const paddingLeft =
    legendPosition === "left" && yAxisWidth ? yAxisWidth - 8 : 0;

  return (
    <div
      className={cn(
        "flex items-center",
        { "justify-center": legendPosition === "center" },
        {
          "justify-start": legendPosition === "left",
        },
        { "justify-end": legendPosition === "right" },
      )}
      ref={legendRef}
      style={{ paddingLeft: paddingLeft }}
    >
      <Legend
        activeLegend={activeLegend}
        chartTitle={chartTitle}
        enableLegendSlider={enableLegendSlider}
        items={legendItems}
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
  color: AvailableChartColorsKeys;
  dataKey: string;
  type?: string;
  payload: any;
};

interface ChartTooltipProps {
  active: boolean | undefined;
  payload: PayloadItem[];
  label: string;
  valueFormatter: (value: number) => string;
}

const ChartTooltip = ({
  active,
  payload,
  label,
  valueFormatter,
}: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={cn(
          // base
          "rounded-md border text-sm shadow-md",
          // border color
          "border-gray-200 dark:border-gray-800",
          // background color
          "bg-white dark:bg-gray-950",
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
            {label}
          </p>
        </div>
        <div className={cn("space-y-1 px-4 py-2")}>
          {payload.map(({ value, category, color }, index) => (
            <div
              className="flex items-center justify-between space-x-8"
              // biome-ignore lint/suspicious/noArrayIndexKey: <tremor>
              key={`id-${index}`}
            >
              <div className="flex items-center space-x-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 shrink-0 rounded-xs",
                    getColorClassName(color, "bg"),
                  )}
                />
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
                {valueFormatter(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

//#region BarChart

type BaseEventProps = {
  eventType: "category" | "bar";
  categoryClicked: string;
  [key: string]: number | string;
};

type BarChartEventProps = BaseEventProps | null | undefined;

interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[];
  index: string;
  categories: string[];
  chartTitle?: string;
  categoryLabels?: Partial<Record<string, string>>;
  colors?: AvailableChartColorsKeys[];
  valueFormatter?: (value: number) => string;
  startEndOnly?: boolean;
  showXAxis?: boolean;
  xTicksFormatter?: (value: number | string) => string;
  showYAxis?: boolean;
  showGridLines?: boolean;
  yAxisWidth?: number;
  intervalType?: "preserveStartEnd" | "equidistantPreserveStart";
  showTooltip?: boolean;
  showLegend?: boolean;
  autoMinValue?: boolean;
  minValue?: number;
  maxValue?: number;
  allowDecimals?: boolean;
  onValueChange?: (value: BarChartEventProps) => void;
  enableLegendSlider?: boolean;
  tickGap?: number;
  barCategoryGap?: string | number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  layout?: "vertical" | "horizontal";
  type?: "default" | "stacked" | "percent";
  legendPosition?: "left" | "center" | "right";
  tooltipCallback?: (tooltipCallbackContent: TooltipProps) => void;
  customTooltip?: React.ComponentType<TooltipProps>;
}

const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  (props, forwardedRef) => {
    const {
      data = [],
      categories = [],
      index,
      chartTitle,
      categoryLabels,
      colors = AvailableChartColors,
      valueFormatter = (value: number) => value.toString(),
      startEndOnly = false,
      showXAxis = true,
      xTicksFormatter,
      showYAxis = true,
      showGridLines = true,
      yAxisWidth = 56,
      intervalType = "equidistantPreserveStart",
      showTooltip = true,
      showLegend = true,
      autoMinValue = false,
      minValue,
      maxValue,
      allowDecimals = true,
      className,
      onValueChange,
      enableLegendSlider = false,
      barCategoryGap,
      tickGap = 5,
      xAxisLabel,
      yAxisLabel,
      layout = "horizontal",
      type = "default",
      legendPosition = "right",
      tooltipCallback,
      customTooltip,
      ...other
    } = props;
    const CustomTooltip = customTooltip;
    const paddingValue =
      (!showXAxis && !showYAxis) || (startEndOnly && !showYAxis) ? 0 : 20;
    const [legendHeight, setLegendHeight] = React.useState(60);
    const [activeLegend, setActiveLegend] = React.useState<string | undefined>(
      undefined,
    );
    const categoryColors = constructCategoryColors(categories, colors);
    const categoryLabelMap = React.useMemo(() => {
      const map = new Map<string, string>();
      categories.forEach((category) => {
        map.set(category, categoryLabels?.[category] ?? category);
      });
      return map;
    }, [categories, categoryLabels]);
    const [activeBar, setActiveBar] = React.useState<any | undefined>(
      undefined,
    );
    const yAxisDomain = getYAxisDomain(autoMinValue, minValue, maxValue);
    const hasOnValueChange = !!onValueChange;
    const stacked = type === "stacked" || type === "percent";

    const prevActiveRef = React.useRef<boolean | undefined>(undefined);
    const prevLabelRef = React.useRef<string | undefined>(undefined);

    function valueToPercent(value: number) {
      return `${(value * 100).toFixed(0)}%`;
    }

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

    function onCategoryClick(dataKey: string) {
      if (!hasOnValueChange) return;
      if (dataKey === activeLegend && !activeBar) {
        setActiveLegend(undefined);
        onValueChange?.(null);
      } else {
        setActiveLegend(dataKey);
        onValueChange?.({
          categoryClicked: dataKey,
          eventType: "category",
        });
      }
      setActiveBar(undefined);
    }

    return (
      <div
        className={cn("h-80 w-full", className)}
        ref={forwardedRef}
        tremor-id="tremor-raw"
        {...other}
      >
        <ResponsiveContainer>
          <RechartsBarChart
            barCategoryGap={barCategoryGap}
            data={data}
            layout={layout}
            margin={{
              bottom: xAxisLabel ? 30 : undefined,
              left: yAxisLabel ? 20 : undefined,
              right: yAxisLabel ? 5 : undefined,
              top: 5,
            }}
            onClick={
              hasOnValueChange && (activeLegend || activeBar)
                ? () => {
                    setActiveBar(undefined);
                    setActiveLegend(undefined);
                    onValueChange?.(null);
                  }
                : undefined
            }
            stackOffset={type === "percent" ? "expand" : undefined}
          >
            {showGridLines ? (
              <CartesianGrid
                className={cn("stroke-gray-200 stroke-1 dark:stroke-gray-800")}
                horizontal={layout !== "vertical"}
                vertical={layout === "vertical"}
              />
            ) : null}
            <XAxis
              axisLine={false}
              className={cn(
                // base
                "text-xs",
                // text fill
                "fill-gray-500 dark:fill-gray-500",
                { "mt-4": layout !== "vertical" },
              )}
              fill=""
              hide={!showXAxis}
              minTickGap={tickGap}
              stroke=""
              tick={{
                transform:
                  layout !== "vertical" ? "translate(0, 6)" : undefined,
              }}
              tickFormatter={xTicksFormatter ? xTicksFormatter : undefined}
              tickLine={false}
              {...(layout !== "vertical"
                ? {
                    dataKey: index,
                    interval: startEndOnly ? "preserveStartEnd" : intervalType,
                    padding: {
                      left: paddingValue,
                      right: paddingValue,
                    },
                    ticks: startEndOnly
                      ? [data[0][index], data[data.length - 1][index]]
                      : undefined,
                  }
                : {
                    allowDecimals: allowDecimals,
                    domain: yAxisDomain as AxisDomain,
                    tickFormatter:
                      type === "percent" ? valueToPercent : valueFormatter,
                    type: "number",
                  })}
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
              axisLine={false}
              className={cn(
                // base
                "text-xs",
                // text fill
                "fill-gray-500 dark:fill-gray-500",
              )}
              fill=""
              hide={!showYAxis}
              stroke=""
              tick={{
                transform:
                  layout !== "vertical"
                    ? "translate(-3, 0)"
                    : "translate(0, 0)",
              }}
              tickLine={false}
              width={yAxisWidth}
              {...(layout !== "vertical"
                ? {
                    allowDecimals: allowDecimals,
                    domain: yAxisDomain as AxisDomain,
                    tickFormatter:
                      type === "percent" ? valueToPercent : valueFormatter,
                    type: "number",
                  }
                : {
                    dataKey: index,
                    interval: "equidistantPreserveStart",
                    ticks: startEndOnly
                      ? [data[0][index], data[data.length - 1][index]]
                      : undefined,
                    type: "category",
                  })}
            >
              {yAxisLabel && (
                <Label
                  angle={-90}
                  className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                  offset={-15}
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                >
                  {yAxisLabel}
                </Label>
              )}
            </YAxis>

            {showLegend ? (
              <RechartsLegend
                content={({ payload }) =>
                  ChartLegend(
                    { payload },
                    categoryColors,
                    setLegendHeight,
                    activeLegend,
                    chartTitle,
                    hasOnValueChange
                      ? (clickedLegendItem: string) =>
                          onCategoryClick(clickedLegendItem)
                      : undefined,
                    enableLegendSlider,
                    legendPosition,
                    yAxisWidth,
                    categoryLabelMap,
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
                      category:
                        categoryLabelMap.get(item.dataKey) ?? item.dataKey,
                      color: categoryColors.get(
                        item.dataKey,
                      ) as AvailableChartColorsKeys,
                      dataKey: item.dataKey,
                      index: item.payload[index],
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
                      label={label as string}
                      payload={cleanPayload}
                      valueFormatter={valueFormatter}
                    />
                  )
                ) : null;
              }}
              cursor={{ fill: "#d1d5db", opacity: "0.15" }}
              isAnimationActive={true}
              offset={20}
              position={{
                x: layout === "horizontal" ? undefined : yAxisWidth + 20,
                y: layout === "horizontal" ? 0 : undefined,
              }}
              wrapperStyle={{ outline: "none" }}
            />
            {categories.map((category) => (
              <Bar
                className={cn(
                  getColorClassName(
                    categoryColors.get(category) as AvailableChartColorsKeys,
                    "fill",
                  ),
                  onValueChange ? "cursor-pointer" : "",
                )}
                dataKey={category}
                fill=""
                focusable={false}
                isAnimationActive={false}
                key={category}
                name={category}
                onClick={onBarClick}
                shape={(props: any) =>
                  renderShape(props, activeBar, activeLegend, layout)
                }
                stackId={stacked ? "stack" : undefined}
                type="linear"
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  },
);

BarChart.displayName = "BarChart";

export { BarChart, type BarChartEventProps, type TooltipProps };
