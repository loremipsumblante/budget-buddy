import { Card, CardContent } from "@/components/ui/card";
import { Coins, TrendingDown, PiggyBank } from "lucide-react";
import {
  dailyAllowance,
  daysRemaining,
  formatMoney,
  spentInRange,
  totalDays,
} from "@/lib/budget-math";
import type { Budget, Expense } from "@/lib/types";

export function DailyAllowance({ budget, expenses }: { budget: Budget; expenses: Expense[] }) {
  const allowance = dailyAllowance(budget, expenses);
  const todayPace = budget.total / totalDays(budget);
  const left = daysRemaining(budget);
  const remaining = budget.total - spentInRange(budget, expenses);
  const projectedSavings = remaining - allowance * left;

  const items = [
    {
      icon: Coins,
      label: "Spend per day",
      value: formatMoney(allowance, budget.currency),
      sub: `${left} day${left === 1 ? "" : "s"} left`,
    },
    {
      icon: TrendingDown,
      label: "Original pace",
      value: formatMoney(todayPace, budget.currency),
      sub: "per day",
    },
    {
      icon: PiggyBank,
      label: budget.savingsGoal ? "Savings goal" : "Buffer",
      value: formatMoney(budget.savingsGoal ?? Math.max(0, projectedSavings), budget.currency),
      sub: budget.savingsGoal ? "target" : "projected",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map(({ icon: Icon, label, value, sub }) => (
        <Card key={label} className="border-border/70 shadow-[var(--shadow-card)]">
          <CardContent className="flex items-start gap-3 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{label}</p>
              <p className="truncate text-lg font-semibold tracking-tight">{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
