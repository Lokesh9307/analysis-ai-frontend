// lib/types.ts
export type SeriesPoint = { label: string; value: number | string };
export type Series = { series: string; data: SeriesPoint[] };

export type CleanPoint = { label: string; value: number };
export type CleanSeries = { series: string; data: CleanPoint[] };

export type CleanPayload = {
  data: CleanSeries[];
  summary?: string;
  reasoning?: string;
  chartType?: string;
};

export type WidgetBase = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
};

export type ChartWidget = WidgetBase & {
  kind: "chart";
  payload: CleanPayload;
};

export type TextWidget = WidgetBase & {
  kind: "text";
  text: string;
};

export type Widget = ChartWidget | TextWidget;

export type HistoryItem = {
  id: string;
  fileName: string;
  timestamp: number;
  payload: CleanPayload;
};

// Extend chart types to match API possibilities
export type ChartType =
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "donut"
  | "radialBar"
  | "scatter"
  | "bubble"
  | "heatmap"
  | "candlestick";

export type Dashboard = {
  id: string;
  name: string;
  chartType: ChartType;
  payload?: CleanPayload;
  widgets: Widget[];
  history: HistoryItem[];
};
