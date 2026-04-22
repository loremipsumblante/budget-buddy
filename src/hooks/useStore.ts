import { useEffect, useSyncExternalStore } from "react";
import type { Budget, Expense, StoreState } from "@/lib/types";
import { loadStore, saveStore, uid } from "@/lib/storage";

let state: StoreState = { budgets: [], expenses: [], activeBudgetId: null };
let initialized = false;
const listeners = new Set<() => void>();

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  state = loadStore();
  initialized = true;
}

function setState(updater: (s: StoreState) => StoreState) {
  state = updater(state);
  saveStore(state);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const ssrSnapshot: StoreState = { budgets: [], expenses: [], activeBudgetId: null };

export function useStore() {
  const snap = useSyncExternalStore(
    subscribe,
    () => {
      ensureInit();
      return state;
    },
    () => ssrSnapshot,
  );

  // hydrate on mount in case SSR returned empty snapshot
  useEffect(() => {
    if (!initialized) {
      ensureInit();
      listeners.forEach((l) => l());
    }
  }, []);

  return snap;
}

export const store = {
  addBudget(input: Omit<Budget, "id" | "createdAt">): Budget {
    const budget: Budget = { ...input, id: uid(), createdAt: new Date().toISOString() };
    setState((s) => ({
      ...s,
      budgets: [budget, ...s.budgets],
      activeBudgetId: budget.id,
    }));
    return budget;
  },
  updateBudget(id: string, patch: Partial<Budget>) {
    setState((s) => ({
      ...s,
      budgets: s.budgets.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  },
  deleteBudget(id: string) {
    setState((s) => ({
      ...s,
      budgets: s.budgets.filter((b) => b.id !== id),
      expenses: s.expenses.filter((e) => e.budgetId !== id),
      activeBudgetId: s.activeBudgetId === id ? null : s.activeBudgetId,
    }));
  },
  setActiveBudget(id: string | null) {
    setState((s) => ({ ...s, activeBudgetId: id }));
  },
  addExpense(input: Omit<Expense, "id" | "createdAt">): Expense {
    const expense: Expense = { ...input, id: uid(), createdAt: new Date().toISOString() };
    setState((s) => ({ ...s, expenses: [expense, ...s.expenses] }));
    return expense;
  },
  updateExpense(id: string, patch: Partial<Expense>) {
    setState((s) => ({
      ...s,
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  },
  deleteExpense(id: string) {
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
  },
};

export function useActiveBudget(): Budget | null {
  const s = useStore();
  return s.budgets.find((b) => b.id === s.activeBudgetId) ?? s.budgets[0] ?? null;
}
