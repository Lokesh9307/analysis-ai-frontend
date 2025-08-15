// lib/clean.ts
import { CleanPayload, CleanSeries } from "./types";

export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export function isMonthLabel(label: string) {
  return MONTHS.includes(label);
}

/** Backend response type */
export type BackendResponse = {
  data?: { series?: string; data?: { label?: string; value?: number | string }[] }[];
  summary?: string;
  reasoning?: string;
  chartType?: string;
};

/** Convert backend response → CleanPayload */
export function cleanPayload(raw: BackendResponse): CleanPayload {
  const cleanedSeries: CleanSeries[] = (raw.data || []).map((s) => ({
    series: String(s.series ?? "").trim() || "Series",
    data: (s.data || [])
      .map((p) => {
        const label = String(p.label ?? "").trim();
        const num = typeof p.value === "number"
          ? p.value
          : Number(String(p.value ?? "").replace(/[, ]/g, ""));
        return { label, value: Number.isFinite(num) ? num : 0 };
      })
      .filter((p) => p.label.length > 0),
  }));

  const categoriesSet = new Set<string>();
  cleanedSeries.forEach((s) => s.data.forEach((p) => categoriesSet.add(p.label)));
  let categories = Array.from(categoriesSet);

  const hasMostlyMonths =
    categories.filter(isMonthLabel).length >= Math.max(4, Math.floor(categories.length / 2));
  if (hasMostlyMonths) {
    categories.sort((a, b) => MONTHS.indexOf(a) - MONTHS.indexOf(b));
  } else {
    categories.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  const aligned: CleanSeries[] = cleanedSeries.map((s) => {
    const map = new Map(s.data.map((p) => [p.label, p.value]));
    return {
      series: s.series,
      data: categories.map((label) => ({ label, value: map.get(label) ?? 0 })),
    };
  });

  return {
    data: aligned,
    summary: raw.summary,
    reasoning: raw.reasoning,
    chartType: raw.chartType,
  };
}

/** Convert CleanPayload → ApexCharts format */
export type ChartSeries = { name: string; data: number[] };
export function toApex(payload: CleanPayload | null): { categories: string[]; series: ChartSeries[] } {
  if (!payload || (payload.data || []).length === 0) return { categories: [], series: [] };
  const categories = payload.data[0].data.map((d) => d.label);
  const series: ChartSeries[] = payload.data.map((s) => ({
    name: s.series,
    data: s.data.map((d) => d.value),
  }));
  return { categories, series };
}

/** Map backend chartType → ApexCharts type */
export function mapChartType(
  t?: string
): "bar" | "area" | "line" | "pie" | "donut" | "radialBar" | "scatter" | "bubble" | "heatmap" | "candlestick" {
  const x = (t || "").toLowerCase();

  if (x.includes("line")) return "line";
  if (x.includes("area")) return "area";
  if (x.includes("pie")) return "pie";
  if (x.includes("donut")) return "donut";
  if (x.includes("radialbar") || x.includes("radial")) return "radialBar";
  if (x.includes("scatter")) return "scatter";
  if (x.includes("bubble")) return "bubble";
  if (x.includes("heatmap")) return "heatmap";
  if (x.includes("candle")) return "candlestick";

  return "bar"; // default
}
