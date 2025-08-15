"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dashboard,
  Widget,
  ChartWidget,
  TextWidget,
  CleanPayload,
  HistoryItem,
  ChartType,
} from "@/lib/types";
import { cleanPayload, mapChartType } from "@/lib/clean";
import { loadDashboards, saveDashboards, loadActiveId, saveActiveId } from "@/lib/storage";
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";

const newId = () => Math.random().toString(36).slice(2, 10);

export function useDashboards() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  /** Load dashboards & active ID from localStorage */
  useEffect(() => {
    setDashboards(loadDashboards());
    setActiveId(loadActiveId());
  }, []);

  useEffect(() => saveDashboards(dashboards), [dashboards]);
  useEffect(() => saveActiveId(activeId), [activeId]);

  /** Create a new dashboard */
  const createDashboard = useCallback((name: string) => {
    const id = newId();
    const dash: Dashboard = {
      id,
      name: name || "Untitled",
      chartType: "bar",
      widgets: [],
      history: [],
    };
    setDashboards(prev => [dash, ...prev]);
    setActiveId(id);
    console.log("createDashboard: Created dashboard", id); // Debug log
  }, []);

  /** Rename dashboard */
  const renameDashboard = useCallback((id: string, name: string) => {
    setDashboards(prev => prev.map(d => (d.id === id ? { ...d, name } : d)));
    console.log("renameDashboard: Renamed dashboard", id, "to", name); // Debug log
  }, []);

  /** Remove dashboard */
  const removeDashboard = useCallback((id: string) => {
    setDashboards(prev => prev.filter(d => d.id !== id));
    setActiveId(curr => (curr === id ? null : curr));
    console.log("removeDashboard: Removed dashboard", id); // Debug log
  }, []);

  /** Add a chart widget */
  const addChartWidget = useCallback((dashboardId?: string, payload?: CleanPayload) => {
    const targetId = dashboardId || activeId;
    if (!targetId) {
      console.warn("addChartWidget: No target dashboard ID", { dashboardId, activeId }); // Debug log
      return;
    }

    const widget: ChartWidget = {
      id: newId(),
      kind: "chart",
      x: 240,
      y: 120,
      w: 720,
      h: 420,
      zIndex: 1,
      payload: payload || { data: [], chartType: "bar" },
    };

    setDashboards(prev =>
      prev.map(d => (d.id === targetId ? { ...d, widgets: [...d.widgets, widget] } : d))
    );
    console.log("addChartWidget: Added widget", widget.id, "to dashboard", targetId); // Debug log
  }, [activeId]);

  /** Add a text widget */
  const addTextWidget = useCallback(() => {
    if (!activeId) {
      console.warn("addTextWidget: No active dashboard"); // Debug log
      return;
    }

    const widget: TextWidget = {
      id: newId(),
      kind: "text",
      text: "Type your notes here…",
      x: 300,
      y: 560,
      w: 360,
      h: 180,
      zIndex: 1,
    };

    setDashboards(prev =>
      prev.map(d => (d.id === activeId ? { ...d, widgets: [...d.widgets, widget] } : d))
    );
    console.log("addTextWidget: Added text widget", widget.id); // Debug log
  }, [activeId]);

  /** Update a widget */
  const updateWidget = useCallback((widgetId: string, patch: Partial<Widget>) => {
    if (!activeId) {
      console.warn("updateWidget: No active dashboard"); // Debug log
      return;
    }
    setDashboards(prev =>
      prev.map(d =>
        d.id === activeId
          ? {
              ...d,
              widgets: d.widgets.map(w => {
                if (w.id !== widgetId) return w;
                if (w.kind === "chart") {
                  return { ...w, ...patch, kind: "chart" } as ChartWidget;
                } else if (w.kind === "text") {
                  return { ...w, ...patch, kind: "text" } as TextWidget;
                }
                return w;
              }),
            }
          : d
      )
    );
    console.log("updateWidget: Updated widget", widgetId); // Debug log
  }, [activeId]);

  /** Remove a widget */
  const removeWidget = useCallback((widgetId: string) => {
    if (!activeId) {
      console.warn("removeWidget: No active dashboard"); // Debug log
      return;
    }
    setDashboards(prev =>
      prev.map(d =>
        d.id === activeId ? { ...d, widgets: d.widgets.filter(w => w.id !== widgetId) } : d
      )
    );
    console.log("removeWidget: Removed widget", widgetId); // Debug log
  }, [activeId]);

  /** Import analysis file to active dashboard */
  const importAnalysisToActive = useCallback(
    async (file: File, query: string, chartType: ChartType): Promise<CleanPayload> => {
      if (!activeId) {
        console.error("importAnalysisToActive: No active dashboard"); // Debug log
        throw new Error("No active dashboard");
      }

      console.log("importAnalysisToActive: Processing import for file", file.name); // Debug log
      const form = new FormData();
      form.append("file", file);
      form.append("query", query);
      form.append("chartType", chartType);

      try {
        const res = await fetch("https://analysis-api-yihi.onrender.com/api/analyze", {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          console.error("importAnalysisToActive: Fetch failed with status", res.status); // Debug log
          throw new Error(`HTTP ${res.status}`);
        }

        const raw = await res.json();
        console.log("Backend response:", JSON.stringify(raw, null, 2)); // Debug log
        const cleaned: CleanPayload = cleanPayload(raw);
        console.log("Cleaned payload:", JSON.stringify(cleaned, null, 2)); // Debug log

        const item: HistoryItem = {
          id: newId(),
          fileName: file.name,
          timestamp: Date.now(),
          payload: cleaned,
        };

        const newWidget: ChartWidget = {
          id: newId(),
          kind: "chart",
          x: 240 + (dashboards.find(d => d.id === activeId)?.widgets.length || 0) * 20,
          y: 120 + (dashboards.find(d => d.id === activeId)?.widgets.length || 0) * 20,
          w: 720,
          h: 420,
          zIndex: 1,
          payload: cleaned,
        };

        setDashboards(prev =>
          prev.map(d =>
            d.id === activeId
              ? {
                  ...d,
                  chartType: mapChartType(cleaned.chartType || chartType),
                  payload: cleaned,
                  history: [item, ...d.history],
                  widgets: [...d.widgets, newWidget], // Add single widget here
                }
              : d
          )
        );

        console.log("importAnalysisToActive: Added widget", newWidget.id, "to dashboard", activeId); // Debug log
        return cleaned;
      } catch (error) {
        console.error("importAnalysisToActive: Error during import:", error);
        throw error; // Re-throw the error so calling components can handle it
      }
    },
    [activeId, dashboards]
  );

  /** Export dashboard as PNG */
  const exportAsImage = useCallback(async (id: string | null) => {
    if (!id) {
      console.warn("exportAsImage: No dashboard ID provided"); // Debug log
      return;
    }
    const el = document.getElementById(`dashboard-canvas-${id}`);
    if (!el) {
      console.warn("exportAsImage: Canvas element not found for ID", id); // Debug log
      return;
    }
    try {
      const dataUrl = await htmlToImage.toPng(el, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `dashboard-${id}.png`;
      a.click();
      console.log("exportAsImage: Exported dashboard", id, "as PNG"); // Debug log
    } catch (error) {
      console.error("exportAsImage: Error exporting as PNG:", error); // Log the error
      // Optionally, show a user-friendly message
      // alert("Failed to export dashboard as PNG. Please try again.");
    }
  }, []);

  /** Export dashboard as PDF */
  const exportAsPdf = useCallback(async (id: string | null) => {
    if (!id) {
      console.warn("exportAsPdf: No dashboard ID provided"); // Debug log
      return;
    }
    const el = document.getElementById(`dashboard-canvas-${id}`);
    if (!el) {
      console.warn("exportAsPdf: Canvas element not found for ID", id); // Debug log
      return;
    }
    try {
      const dataUrl = await htmlToImage.toPng(el, { pixelRatio: 2, cacheBust: true });
      const pdf = new jsPDF({ orientation: "l", unit: "px", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Use a Promise to handle image loading and potential errors more robustly
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => {
          console.error("Image loading error for PDF export:", e);
          reject(new Error("Image failed to load for PDF export"));
        };
        img.src = dataUrl;
      });
      
      // Only decode if the image successfully loaded (or if decode is needed after load event)
      // The previous error implied img.decode() could also fail
      await img.decode(); 

      const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      const x = (pageWidth - w) / 2;
      const y = (pageHeight - h) / 2;
      pdf.addImage(dataUrl, "PNG", x, y, w, h);
      pdf.save(`dashboard-${id}.pdf`);
      console.log("exportAsPdf: Exported dashboard", id, "as PDF"); // Debug log
    } catch (error) {
      console.error("exportAsPdf: Error exporting as PDF:", error); // Log the error
      // Optionally, show a user-friendly message
      // alert("Failed to export dashboard as PDF. Please try again.");
    }
  }, []);

  return {
    dashboards,
    activeId,
    setActiveId,
    createDashboard,
    renameDashboard,
    removeDashboard,
    addChartWidget,
    addTextWidget,
    updateWidget,
    removeWidget,
    importAnalysisToActive,
    exportAsImage,
    exportAsPdf,
  };
}
