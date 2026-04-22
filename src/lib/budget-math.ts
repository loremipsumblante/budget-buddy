import { differenceInCalendarDays, isWithinInterval, parseISO, startOfDay } from "date-fns";
import type { Budget, Expense } from "./types";

export function expensesForBudget(budget: Budget, all: Expense[]): Expense[] {
  return all.filter((e) => e.budgetId === budget.id);
}

export function totalSpent(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

export function spentInRange(budget: Budget, expenses: Expense[]): number {
  const start = startOfDay(parseISO(budget.startDate));
  const end = startOfDay(parseISO(budget.endDate));
  return expensesForBudget(budget, expenses)
    .filter((e) => {
      const d = startOfDay(parseISO(e.date));
      return isWithinInterval(d, { start, end });
    })
    .reduce((s, e) => s + e.amount, 0);
}

export function totalDays(budget: Budget): number {
  return Math.max(
    1,
    differenceInCalendarDays(parseISO(budget.endDate), parseISO(budget.startDate)) + 1,
  );
}

export function daysElapsed(budget: Budget, today = new Date()): number {
  const start = startOfDay(parseISO(budget.startDate));
  const t = startOfDay(today);
  if (t < start) return 0;
  const elapsed = differenceInCalendarDays(t, start) + 1;
  return Math.min(elapsed, totalDays(budget));
}

export function daysRemaining(budget: Budget, today = new Date()): number {
  return Math.max(0, totalDays(budget) - daysElapsed(budget, today));
}

export function dailyAllowance(budget: Budget, expenses: Expense[]): number {
  const remaining = budget.total - spentInRange(budget, expenses) - (budget.savingsGoal ?? 0);
  const left = Math.max(1, daysRemaining(budget) || totalDays(budget));
  return Math.max(0, remaining / left);
}

export function paceStatus(
  budget: Budget,
  expenses: Expense[],
): { label: "on-track" | "watch" | "over"; expected: number; spent: number } {
  const spent = spentInRange(budget, expenses);
  const elapsed = Math.max(1, daysElapsed(budget));
  const total = totalDays(budget);
  const expected = (budget.total / total) * elapsed;
  if (spent <= expected * 0.9) return { label: "on-track", expected, spent };
  if (spent <= expected * 1.05) return { label: "watch", expected, spent };
  return { label: "over", expected, spent };
}

export function formatMoney(amount: number, currency = "$") {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}${currency}${abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function spentByCategory(expenses: Expense[]) {
  const map: Record<string, number> = {};
  for (const e of expenses) map[e.category] = (map[e.category] ?? 0) + e.amount;
  return map;
}
