"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type SeriesData =
  | { name: string; data: number[] }
  | { name: string; data: { x: any; y: any }[] };

type Props = {
  categories?: string[];
  series: SeriesData[] | number[];
  type:
    | "line"
    | "area"
    | "bar"
    | "pie"
    | "donut"
    | "radialBar"
    | "scatter"
    | "bubble"
    | "heatmap"
    | "candlestick";
};

export default function ChartWidget({ categories = [], series, type }: Props) {
  const chartTypesWithCategories = ["line", "area", "bar", "heatmap"];

  const options: ApexOptions = {
    chart: {
      background: "transparent",
      foreColor: "#E5E7EB",
      toolbar: { show: false },
    },
    theme: { mode: "dark" },
    grid: { borderColor: "#30363d" },
    xaxis: chartTypesWithCategories.includes(type) && categories.length > 0
      ? {
          categories,
          axisBorder: { color: "#4b5563" },
          axisTicks: { color: "#4b5563" },
          labels: { style: { colors: "#CBD5E1" } },
        }
      : undefined,
    yaxis:
      type !== "pie" && type !== "donut" && type !== "radialBar"
        ? { labels: { style: { colors: "#CBD5E1" } } }
        : undefined,
    legend: { labels: { colors: "#E5E7EB" } },
    dataLabels: { enabled: false },
    stroke: { width: type === "line" ? 3 : 2, curve: "smooth" },
    tooltip: { theme: "dark" },
  };

  const formattedSeries =
    Array.isArray(series) && typeof series[0] === "number"
      ? [{ name: "Series 1", data: series as number[] }]
      : (series as SeriesData[]);

  return (
    <ApexChart
      options={options}
      series={formattedSeries}
      type={type}
      width="100%"
      height="100%"
    />
  );
}
