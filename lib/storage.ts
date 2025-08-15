import { Dashboard } from "./types";

const KEY = "analysis-ai-dashboards";
const ACTIVE = "analysis-ai-active";

export function loadDashboards(): Dashboard[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDashboards(d: Dashboard[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}

export function loadActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE);
  } catch {
    return null;
  }
}

export function saveActiveId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE, id);
    else localStorage.removeItem(ACTIVE);
  } catch {}
}
