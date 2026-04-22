export type Category =
  | "food"
  | "transport"
  | "shopping"
  | "bills"
  | "entertainment"
  | "health"
  | "other";

export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "food", label: "Food", emoji: "🍽️" },
  { id: "transport", label: "Transport", emoji: "🚌" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "bills", label: "Bills", emoji: "🧾" },
  { id: "entertainment", label: "Entertainment", emoji: "🎬" },
  { id: "health", label: "Health", emoji: "💊" },
  { id: "other", label: "Other", emoji: "✨" },
];

export type PeriodPreset = "weekly" | "biweekly" | "monthly" | "custom";

export interface Budget {
  id: string;
  name: string;
  total: number;
  currency: string;
  startDate: string; // ISO
  endDate: string; // ISO
  preset: PeriodPreset;
  savingsGoal?: number;
  categoryLimits: Partial<Record<Category, number>>;
  createdAt: string;
}

export interface Expense {
  id: string;
  budgetId: string;
  amount: number;
  category: Category;
  note: string;
  date: string; // ISO date (yyyy-mm-dd)
  createdAt: string;
}

export interface StoreState {
  budgets: Budget[];
  expenses: Expense[];
  activeBudgetId: string | null;
}
