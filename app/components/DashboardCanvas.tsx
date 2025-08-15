"use client";

import { Rnd } from "react-rnd";
import ChartWidget from "@/app/components/ChartWidget";
import TextWidget from "@/app/components/TextWidget";
import { Dashboard, Widget, CleanPayload } from "@/lib/types";
import { toApex, mapChartType } from "@/lib/clean";
import { GrClose } from "react-icons/gr";

type Props = {
  dashboard: Dashboard | null;
  onUpdateWidget: (id: string, patch: Partial<Widget>) => void;
  onRemoveWidget: (id: string) => void;
};

type ApexChartType =
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

export default function DashboardCanvas({
  dashboard,
  onUpdateWidget,
  onRemoveWidget,
}: Props) {
  if (!dashboard) {
    return (
      <div className="flex-1 grid place-items-center text-gray-500">
        Create or select a dashboard
      </div>
    );
  }

  return (
    <div
      id={`dashboard-canvas-${dashboard.id}`}
      className="relative flex-1 overflow-auto bg-[radial-gradient(circle_at_25%_10%,rgba(88,94,255,0.07),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(0,212,255,0.06),transparent_35%)]"
    >
      {dashboard.widgets.map((w) => {
        // Get widget-specific chart data
        let categories: string[] = [];
        let series: any[] = [];
        let chartType: ApexChartType = "bar";

        if (w.kind === "chart" && w.payload) {
          const apex = toApex(w.payload as CleanPayload);
          categories = apex.categories;
          series = apex.series;
          chartType = mapChartType(
            (w.payload as CleanPayload).chartType || "bar"
          ) as ApexChartType;
        }

        return (
          <Rnd
            key={w.id}
            default={{ x: w.x, y: w.y, width: w.w, height: w.h }}
            bounds="parent"
            onDragStop={(_, d) => onUpdateWidget(w.id, { x: d.x, y: d.y })}
            onResizeStop={(_, __, ref, ___, pos) =>
              onUpdateWidget(w.id, {
                w: ref.offsetWidth,
                h: ref.offsetHeight,
                x: pos.x,
                y: pos.y,
              })
            }
            className="absolute rounded-2xl border border-[#273043] bg-[#0F141B] shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden group"
          >
            {/* Remove button */}
            <button
              className="absolute h-4 top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 font-extrabold hover:scale-110 rounded-md z-20 p-2"
              onClick={() => onRemoveWidget(w.id)}
            >
              <GrClose className="inline-block text-xs font-semibold" />
            </button>

            <div className="h-full w-full">
              {w.kind === "chart" ? (
                categories.length > 0 && series.length > 0 ? (
                  <ChartWidget
                    categories={categories}
                    series={series}
                    type={chartType}
                  />
                ) : (
                  <div className="h-full grid place-items-center text-sm text-gray-500">
                    No chart data available
                  </div>
                )
              ) : (
                <TextWidget
                  text={w.text}
                  onChange={(text) => onUpdateWidget(w.id, { text })}
                />
              )}
            </div>
          </Rnd>
        );
      })}
    </div>
  );
}
