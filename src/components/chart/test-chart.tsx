"use client";

import { ComboChart } from "@/components/ui/combo-chart";

const chartdata = [
  {
    date: "Jan 23",
    Inverters: 2338,
    SolarPanels: 2890,
  },
  {
    date: "Feb 23",
    Inverters: 2103,
    SolarPanels: 2756,
  },
  {
    date: "Mar 23",
    Inverters: 2194,
    SolarPanels: 3322,
  },
  {
    date: "Apr 23",
    Inverters: 2108,
    SolarPanels: 3470,
  },
  {
    date: "May 23",
    Inverters: 1812,
    SolarPanels: 3475,
  },
  {
    date: "Jun 23",
    Inverters: 1726,
    SolarPanels: 3129,
  },
  {
    date: "Jul 23",
    Inverters: 1982,
    SolarPanels: 3490,
  },
  {
    date: "Aug 23",
    Inverters: 2012,
    SolarPanels: 2903,
  },
  {
    date: "Sep 23",
    Inverters: 2342,
    SolarPanels: 2643,
  },
  {
    date: "Oct 23",
    Inverters: 2473,
    SolarPanels: 2837,
  },
  {
    date: "Nov 23",
    Inverters: 3848,
    SolarPanels: 2954,
  },
  {
    date: "Dec 23",
    Inverters: 3736,
    SolarPanels: 3239,
  },
];

export const ComboChartSingleAxisExample = () => (
  <ComboChart
    barSeries={{
      categories: ["SolarPanels"],
    }}
    data={chartdata}
    index="date"
    lineSeries={{
      categories: ["Inverters"],
      colors: ["emerald"],
    }}
  />
);
