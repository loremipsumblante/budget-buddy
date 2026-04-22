import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  daysElapsed,
  daysRemaining,
  formatMoney,
  paceStatus,
  spentInRange,
  totalDays,
} from "@/lib/budget-math";
import type { Budget, Expense } from "@/lib/types";

const paceStyles: Record<"on-track" | "watch" | "over", string> = {
  "on-track": "bg-emerald-500/20 text-emerald-700",
  watch: "bg-amber-500/20 text-amber-700",
  over: "bg-rose-500/20 text-rose-700",
};
const paceLabel: Record<"on-track" | "watch" | "over", string> = {
  "on-track": "On track",
  watch: "Watch your pace",
  over: "Over budget pace",
};

export function BudgetSummary({ budget, expenses }: { budget: Budget; expenses: Expense[] }) {
  const spent = spentInRange(budget, expenses);
  const remaining = budget.total - spent;
  const pct = Math.min(100, (spent / budget.total) * 100);
  const pace = paceStatus(budget, expenses);
  const elapsed = daysElapsed(budget);
  const total = totalDays(budget);
  const left = daysRemaining(budget);

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-primary-foreground/75">
              {budget.name}
            </p>
            <p className="mt-1 text-sm text-primary-foreground/80">
              {format(parseISO(budget.startDate), "MMM d")} —{" "}
              {format(parseISO(budget.endDate), "MMM d")}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${paceStyles[pace.label]}`}
          >
            {paceLabel[pace.label]}
          </span>
        </div>

        <div>
          <p className="text-xs text-primary-foreground/75">Remaining</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">
            {formatMoney(remaining, budget.currency)}
          </p>
          <p className="mt-1 text-sm text-primary-foreground/80">
            of {formatMoney(budget.total, budget.currency)} ·{" "}
            {formatMoney(spent, budget.currency)} spent
          </p>
        </div>

        <div className="space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-primary-foreground/20">
            <div
              className="h-full rounded-full bg-primary-foreground transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-primary-foreground/85">
            <span>
              Day {elapsed} of {total}
            </span>
            <span>{left} day{left === 1 ? "" : "s"} left</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
