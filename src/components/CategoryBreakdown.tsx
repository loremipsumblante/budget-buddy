import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES, type Category } from "@/lib/types";
import type { Budget, Expense } from "@/lib/types";
import { formatMoney, spentByCategory } from "@/lib/budget-math";

export function CategoryBreakdown({
  budget,
  expenses,
}: {
  budget: Budget;
  expenses: Expense[];
}) {
  const own = expenses.filter((e) => e.budgetId === budget.id);
  const totals = spentByCategory(own);
  const items = CATEGORIES.map((c) => ({
    ...c,
    spent: totals[c.id] ?? 0,
    limit: budget.categoryLimits[c.id as Category] ?? 0,
  })).filter((i) => i.spent > 0 || i.limit > 0);

  if (items.length === 0) {
    return (
      <Card className="border-dashed border-border/70 bg-muted/30 shadow-none">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No category limits set. Add expenses or category caps to see your breakdown.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardContent className="space-y-4 p-5">
        <h3 className="text-sm font-semibold">Category breakdown</h3>
        <div className="space-y-3">
          {items.map((i) => {
            const ratio = i.limit ? Math.min(1, i.spent / i.limit) : 0;
            const over = i.limit && i.spent > i.limit;
            return (
              <div key={i.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span aria-hidden>{i.emoji}</span> {i.label}
                  </span>
                  <span className="text-muted-foreground">
                    {formatMoney(i.spent, budget.currency)}
                    {i.limit > 0 && (
                      <span className="text-muted-foreground/70">
                        {" "}
                        / {formatMoney(i.limit, budget.currency)}
                      </span>
                    )}
                  </span>
                </div>
                {i.limit > 0 && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${over ? "bg-destructive" : "bg-primary"}`}
                      style={{ width: `${Math.max(2, ratio * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
