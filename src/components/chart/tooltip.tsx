import type { ReactNode } from "react";
import type { TooltipProps } from "@/components/ui/chart/bar-chart";
import { Separator } from "@/components/ui/separator";
import { getColorClassName } from "@/lib/chart-utils";

type TooltipPayload = NonNullable<TooltipProps["payload"]>;
type TooltipPayloadItem = TooltipPayload[number];

type TooltipValueFormatter = (args: {
  value: TooltipPayloadItem["value"];
  payload: TooltipPayloadItem;
}) => ReactNode;

export type TooltipCategoryConfig = {
  dataKey: string;
  label?: string;
  valueFormatter?: TooltipValueFormatter;
};

type TooltipRenderContentParams = {
  payload: TooltipPayload;
  categories: TooltipCategoryConfig[];
};

export type TooltipRenderContent = (
  args: TooltipRenderContentParams,
) => ReactNode;

type TooltipRenderOptions = {
  formatLabelTitle?: (value: string | number) => string;
  renderContent?: TooltipRenderContent;
};

const formatValue = (value: TooltipPayloadItem["value"]) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  }

  if (typeof value === "string") {
    return value;
  }

  return "—";
};

const renderDefaultContent = ({
  payload,
  categories,
}: TooltipRenderContentParams) =>
  categories.map(({ dataKey, label: categoryLabel, valueFormatter }) => {
    const payloadItem = payload.find((item) => item.dataKey === dataKey);
    if (!payloadItem) return null;
    if (Number(payloadItem.value) === 0) return null;

    const displayLabel = categoryLabel ?? payloadItem.category ?? dataKey;
    const formattedValue =
      valueFormatter?.({
        payload: payloadItem,
        value: payloadItem.value,
      }) ?? formatValue(payloadItem.value);

    const colorClassName = payloadItem.color
      ? getColorClassName(payloadItem.color, "bg")
      : "bg-gray-300";

    return (
      <div className="flex items-center justify-between" key={dataKey}>
        <div className="flex items-center space-x-2">
          <span
            aria-hidden="true"
            className={`size-2.5 shrink-0 rounded-xs ${colorClassName}`}
          />
          <p className="text-gray-700 dark:text-gray-400">{displayLabel}</p>
        </div>
        <p className="font-medium text-gray-900 tabular-nums dark:text-gray-50">
          {formattedValue}
        </p>
      </div>
    );
  });

export function createTooltip(
  config: TooltipCategoryConfig[] = [],
  options?: TooltipRenderOptions,
) {
  const Tooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;

    const categoriesToRender: TooltipCategoryConfig[] =
      config.length > 0
        ? config
        : payload.map((item) => ({
            dataKey: item.dataKey,
            label: item.category,
          }));

    const innerContent =
      options?.renderContent?.({
        categories: categoriesToRender,
        payload,
      }) ??
      renderDefaultContent({
        categories: categoriesToRender,
        payload,
      });

    const labelTitle = options?.formatLabelTitle
      ? options.formatLabelTitle(label)
      : label;

    return (
      <div className="bg-card w-56 rounded-lg border text-sm shadow-xs dark:border-gray-800">
        <p className="mb-2 px-3 pt-2 font-medium">{labelTitle}</p>
        <Separator />
        <div className="flex flex-col space-y-2 p-3 py-2">{innerContent}</div>
      </div>
    );
  };

  Tooltip.displayName = "ChartCustomTooltip";

  return Tooltip;
}
