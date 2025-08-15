
"use client";

import React, { useRef, useState, useCallback } from "react";
import { Dashboard, CleanPayload, ChartType } from "@/lib/types";
import { MdDelete, MdDriveFileRenameOutline } from "react-icons/md";

type Props = {
  dashboards: Dashboard[];
  activeId: string | null;
  onSelectDashboard: (id: string) => void;
  onNewDashboard: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onImportFile: (file: File, query: string, chartType: ChartType) => Promise<CleanPayload>;
  onAddWidget: () => void; // Added to Props type
};

export default function Sidebar({
  dashboards,
  activeId,
  onSelectDashboard,
  onNewDashboard,
  onRename,
  onDelete,
  onImportFile,
  onAddWidget,
}: Props) {
  const [query, setQuery] = useState("");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isImporting = useRef(false); // Prevent duplicate imports

  const chartOptions: { value: ChartType; label: string }[] = [
    { value: "bar", label: "Bar" },
    { value: "line", label: "Line" },
    { value: "area", label: "Area" },
    { value: "pie", label: "Pie" },
    { value: "donut", label: "Donut" },
    { value: "radialBar", label: "Radial Bar" },
    { value: "scatter", label: "Scatter" },
    { value: "bubble", label: "Bubble" },
    { value: "heatmap", label: "Heatmap" },
    { value: "candlestick", label: "Candlestick" },
  ];

  const handleImport = useCallback(async () => {
    if (isImporting.current) {
      console.log("handleImport: Skipping duplicate import"); // Debug log
      return;
    }
    isImporting.current = true;

    const file = fileRef.current?.files?.[0];
    if (!file) {
      alert("Please select a file");
      isImporting.current = false;
      return;
    }
    if (!activeId) {
      alert("Please select a dashboard");
      isImporting.current = false;
      return;
    }

    setLoading(true);
    try {
      console.log("handleImport: Starting import for file", file.name); // Debug log
      const result = await onImportFile(file, query, chartType);
      if (result.data.length === 1 && result.data[0].series === "Fallback Series") {
        alert("Warning: Incomplete data, displaying minimal chart.");
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import analysis. Please try again.");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
      setQuery("");
      isImporting.current = false;
      console.log("handleImport: Import completed"); // Debug log
    }
  }, [activeId, query, chartType, onImportFile]);

  return (
    <aside className="w-72 bg-[#0F141B] border-r border-[#1F2530] flex flex-col shadow-lg">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#1F2530]">
        <div className="text-lg font-semibold text-white flex items-center gap-2">
          🧠 Analysis AI
        </div>
        <div className="text-xs text-gray-400">Your Dashboards</div>
      </div>

      {/* Import Section */}
      <div className="p-4 border-b border-[#1F2530] space-y-3">
        <div className="text-sm text-gray-400 font-medium">📂 Import Analysis</div>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="block w-full text-sm text-gray-300 
            file:mr-3 file:py-1.5 file:px-3 file:rounded-md 
            file:border-0 file:text-sm file:font-medium 
            file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
        />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter analysis query…"
          className="w-full rounded-md bg-[#111827] border border-[#1F2530] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as ChartType)}
          className="w-full rounded-md bg-[#111827] border border-[#1F2530] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {chartOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleImport}
          disabled={loading || !activeId}
          className={`w-full rounded-md px-3 py-2 text-sm text-white font-medium transition ${
            loading || !activeId ? "bg-gray-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"
          }`}
        >
          {loading ? "📊 Analyzing..." : "📊 Analyze & Add Chart"}
        </button>

        {/* Add Text Widget Button */}
        
      </div>

      {/* New Dashboard Button */}
      <div className="p-3 border-b border-[#1F2530] flex gap-2">
        <button
          onClick={onNewDashboard}
          className="flex-1 rounded-md bg-green-600 hover:bg-green-500 px-3 py-2 text-sm text-white font-medium transition"
        >
          ➕ New Dashboard
        </button>
      </div>

      {/* Dashboard List */}
      <div className="flex-1 overflow-y-auto">
        {dashboards.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            No dashboards yet. Create one to get started 🚀
          </div>
        ) : (
          dashboards.map((d) => (
            <div
              key={d.id}
              className={`px-3 py-3 border-b border-[#111827] cursor-pointer transition bg-black ring-2 ring-white/20 ${
                d.id === activeId ? "bg-[#1B2230]" : "hover:bg-[#121826]"
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectDashboard(d.id)}
                  className="flex-1 text-left font-medium truncate text-white"
                  title={d.name}
                >
                  {d.name}
                </button>
                <button
                  className="text-xs text-gray-400 hover:text-gray-200"
                  onClick={() => {
                    const name = prompt("Rename dashboard", d.name);
                    if (name && name.trim()) onRename(d.id, name.trim());
                  }}
                >
                  <MdDriveFileRenameOutline className="inline-block" />
                </button>
                <button
                  className="text-xs text-red-400 hover:text-red-300"
                  onClick={() => onDelete(d.id)}
                >
                  <MdDelete className="inline-block" />
                </button>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {d.widgets.length} widget(s) • {d.history.length} import(s)
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}