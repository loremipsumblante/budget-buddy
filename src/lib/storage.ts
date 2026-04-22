import type { StoreState } from "./types";

const KEY = "expense-tracker:v1";

const empty: StoreState = { budgets: [], expenses: [], activeBudgetId: null };

export function loadStore(): StoreState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as StoreState;
    return {
      budgets: parsed.budgets ?? [],
      expenses: parsed.expenses ?? [],
      activeBudgetId: parsed.activeBudgetId ?? null,
    };
  } catch {
    return empty;
  }
}

export function saveStore(state: StoreState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
