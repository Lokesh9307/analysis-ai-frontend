"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Toolbar from "@/app/components/Toolbar";
import DashboardCanvas from "@/app/components/DashboardCanvas";
import { useDashboards } from "../hooks/useDashboards";
import { Dashboard } from "@/lib/types";

export default function AnalysisAIPage() {
  const {
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
  } = useDashboards();

  const [isDesktop, setIsDesktop] = useState(true);

  // Detect screen size
  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 1024); // Tailwind lg breakpoint
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Initialize first dashboard
  useEffect(() => {
    if (dashboards.length === 0) createDashboard("My First Dashboard");
  }, [dashboards.length, createDashboard]);

  const active: Dashboard | null =
    dashboards.find((d: Dashboard) => d.id === activeId) || null;

  // Mobile message
  if (!isDesktop) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#0f141b] to-[#1e2633] text-center p-6">
        <div className="bg-[#1f2937] p-8 rounded-2xl shadow-lg max-w-md border border-gray-700 animate-fadeIn">
          <h1 className="text-3xl font-bold text-white mb-4">📊 Desktop Only</h1>
          <p className="text-gray-300 mb-6">
            This dashboard experience is designed for large screens.  
            Please use a laptop or desktop to access all features.
          </p>
          <div className="bg-gray-800 text-gray-400 text-sm p-4 rounded-lg border border-gray-700">
            💡 Tip: Rotate your tablet to landscape mode for better visibility.
          </div>
        </div>
      </div>
    );
  }

  // Desktop UI
  return (
    <div className="flex h-screen w-full">
      <Sidebar
        dashboards={dashboards}
        activeId={activeId}
        onSelectDashboard={setActiveId}
        onNewDashboard={() => createDashboard("Untitled Dashboard")}
        onRename={renameDashboard}
        onDelete={removeDashboard}
        onImportFile={importAnalysisToActive}
        onAddWidget={() => addChartWidget()}
      />
      <main className="flex-1 flex flex-col">
        <Toolbar
          dashboardName={active?.name || ""}
          onAddChart={() => addChartWidget()}
          onAddText={addTextWidget}
          onExportPNG={() => exportAsImage(activeId)}
          onExportPDF={() => exportAsPdf(activeId)}
        />
        <DashboardCanvas
          dashboard={active}
          onUpdateWidget={updateWidget}
          onRemoveWidget={removeWidget}
        />
      </main>
    </div>
  );
}
