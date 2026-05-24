import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Budget, Expense } from "./types";
import { applyRemoteSnapshot, _setRemoteWriter, _clearRemoteWriter } from "@/hooks/useStore";

let currentUid: string | null = null;
let unsubBudgets: Unsubscribe | null = null;
let unsubExpenses: Unsubscribe | null = null;
let gotBudgets = false;
let gotExpenses = false;
let pendingBudgets: Budget[] = [];
let pendingExpenses: Expense[] = [];

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = stripUndefined(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

function maybeApply() {
  if (!gotBudgets || !gotExpenses) return;
  applyRemoteSnapshot({ budgets: pendingBudgets, expenses: pendingExpenses });
}

export function attachStoreToUser(uid: string) {
  if (currentUid === uid) return;
  detachStore();
  currentUid = uid;
  gotBudgets = false;
  gotExpenses = false;
  pendingBudgets = [];
  pendingExpenses = [];

  const budgetsCol = collection(db, "users", uid, "budgets");
  const expensesCol = collection(db, "users", uid, "expenses");

  unsubBudgets = onSnapshot(budgetsCol, (snap) => {
    pendingBudgets = snap.docs.map((d) => d.data() as Budget);
    gotBudgets = true;
    maybeApply();
  });
  unsubExpenses = onSnapshot(expensesCol, (snap) => {
    pendingExpenses = snap.docs.map((d) => d.data() as Expense);
    gotExpenses = true;
    maybeApply();
  });

  _setRemoteWriter({
    upsertBudget: (b) =>
      setDoc(doc(db, "users", uid, "budgets", b.id), stripUndefined(b as unknown as Record<string, unknown>)),
    deleteBudget: async (id) => {
      await deleteDoc(doc(db, "users", uid, "budgets", id));
    },
    upsertExpense: (e) =>
      setDoc(doc(db, "users", uid, "expenses", e.id), stripUndefined(e as unknown as Record<string, unknown>)),
    deleteExpense: async (id) => {
      await deleteDoc(doc(db, "users", uid, "expenses", id));
    },
  });
}

export function detachStore() {
  if (unsubBudgets) unsubBudgets();
  if (unsubExpenses) unsubExpenses();
  unsubBudgets = null;
  unsubExpenses = null;
  currentUid = null;
  _clearRemoteWriter();
}
