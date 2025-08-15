"use client";

import { Share2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type Props = {
  dashboardName: string;
  onAddChart: () => void;
  onAddText: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
};

export default function Toolbar({
  dashboardName,
  onAddChart,
  onAddText,
  onExportPNG,
  onExportPDF,
}: Props) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-[#0F141B] border-b border-[#1F2530]">
      <div className="text-sm text-gray-400">
        {dashboardName || "Untitled Dashboard"}
      </div>
      <div className="mx-2 h-4 w-px bg-[#1F2530]" />
      <button
        onClick={onAddText}
        className="rounded-xl border border-[#263042] bg-[#111827] px-3 py-1.5 text-sm hover:bg-[#151b25] transition"
      >
        + Text
      </button>
    </div>
  );
}
