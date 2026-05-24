import { useEffect, useSyncExternalStore } from "react";
import type { Budget, Expense, StoreState } from "@/lib/types";
import { loadStore, saveStore, uid } from "@/lib/storage";

interface RemoteWriter {
  upsertBudget: (b: Budget) => Promise<void> | void;
  deleteBudget: (id: string) => Promise<void> | void;
  upsertExpense: (e: Expense) => Promise<void> | void;
  deleteExpense: (id: string) => Promise<void> | void;
}

let state: StoreState & { hydrated: boolean } = {
  budgets: [],
  expenses: [],
  activeBudgetId: null,
  hydrated: false,
};
let initialized = false;
let remote: RemoteWriter | null = null;
let applyingRemote = false;
const listeners = new Set<() => void>();

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  const loaded = loadStore();
  state = { ...loaded, hydrated: true };
  initialized = true;
}

function setState(updater: (s: StoreState) => StoreState, persist = true) {
  const next = updater(state);
  state = { ...next, hydrated: true };
  if (persist) saveStore(next);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const ssrSnapshot: StoreState & { hydrated: boolean } = {
  budgets: [],
  expenses: [],
  activeBudgetId: null,
  hydrated: false,
};

export function useStore() {
  return useSyncExternalStore(
    subscribe,
    () => {
      ensureInit();
      return state;
    },
    () => ssrSnapshot,
  );
}

export function useHydrated() {
  const s = useStore();
  useEffect(() => {
    if (!initialized) {
      ensureInit();
      listeners.forEach((l) => l());
    }
  }, []);
  return s.hydrated;
}

function safeWrite(fn: () => Promise<void> | void) {
  try {
    const r = fn();
    if (r instanceof Promise) r.catch((e) => console.error("Firestore write failed:", e));
  } catch (e) {
    console.error("Firestore write failed:", e);
  }
}

export const store = {
  addBudget(input: Omit<Budget, "id" | "createdAt">): Budget {
    const budget: Budget = { ...input, id: uid(), createdAt: new Date().toISOString() };
    setState((s) => ({
      ...s,
      budgets: [budget, ...s.budgets],
      activeBudgetId: budget.id,
    }));
    if (remote && !applyingRemote) safeWrite(() => remote!.upsertBudget(budget));
    return budget;
  },
  updateBudget(id: string, patch: Partial<Budget>) {
    let updated: Budget | undefined;
    setState((s) => ({
      ...s,
      budgets: s.budgets.map((b) => {
        if (b.id !== id) return b;
        updated = { ...b, ...patch };
        return updated;
      }),
    }));
    if (updated && remote && !applyingRemote) safeWrite(() => remote!.upsertBudget(updated!));
  },
  deleteBudget(id: string) {
    const ownExpenses = state.expenses.filter((e) => e.budgetId === id).map((e) => e.id);
    setState((s) => ({
      ...s,
      budgets: s.budgets.filter((b) => b.id !== id),
      expenses: s.expenses.filter((e) => e.budgetId !== id),
      activeBudgetId: s.activeBudgetId === id ? null : s.activeBudgetId,
    }));
    if (remote && !applyingRemote) {
      safeWrite(() => remote!.deleteBudget(id));
      ownExpenses.forEach((eid) => safeWrite(() => remote!.deleteExpense(eid)));
    }
  },
  setActiveBudget(id: string | null) {
    setState((s) => ({ ...s, activeBudgetId: id }));
  },
  addExpense(input: Omit<Expense, "id" | "createdAt">): Expense {
    const expense: Expense = { ...input, id: uid(), createdAt: new Date().toISOString() };
    setState((s) => ({ ...s, expenses: [expense, ...s.expenses] }));
    if (remote && !applyingRemote) safeWrite(() => remote!.upsertExpense(expense));
    return expense;
  },
  updateExpense(id: string, patch: Partial<Expense>) {
    let updated: Expense | undefined;
    setState((s) => ({
      ...s,
      expenses: s.expenses.map((e) => {
        if (e.id !== id) return e;
        updated = { ...e, ...patch };
        return updated;
      }),
    }));
    if (updated && remote && !applyingRemote) safeWrite(() => remote!.upsertExpense(updated!));
  },
  deleteExpense(id: string) {
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
    if (remote && !applyingRemote) safeWrite(() => remote!.deleteExpense(id));
  },
};

export function useActiveBudget(): Budget | null {
  const s = useStore();
  return s.budgets.find((b) => b.id === s.activeBudgetId) ?? s.budgets[0] ?? null;
}

// --- Sync bridge (used by firestore-sync) ---

export function applyRemoteSnapshot(remoteState: { budgets: Budget[]; expenses: Expense[] }) {
  applyingRemote = true;
  try {
    // Merge: prefer remote as source of truth, but keep activeBudgetId if it still exists
    setState((s) => {
      const stillActive = remoteState.budgets.some((b) => b.id === s.activeBudgetId);
      return {
        budgets: remoteState.budgets,
        expenses: remoteState.expenses,
        activeBudgetId: stillActive ? s.activeBudgetId : remoteState.budgets[0]?.id ?? null,
      };
    });
  } finally {
    applyingRemote = false;
  }
}

export function _setRemoteWriter(writer: RemoteWriter) {
  remote = writer;
  // On attach, push any local-only data up so it's not lost.
  if (state.hydrated) {
    state.budgets.forEach((b) => safeWrite(() => writer.upsertBudget(b)));
    state.expenses.forEach((e) => safeWrite(() => writer.upsertExpense(e)));
  }
}

export function _clearRemoteWriter() {
  remote = null;
  // Clear local state on sign-out so the next user doesn't see prior data
  applyingRemote = true;
  try {
    setState(() => ({ budgets: [], expenses: [], activeBudgetId: null }));
  } finally {
    applyingRemote = false;
  }
}
