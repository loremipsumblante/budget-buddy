import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/types";
import type { Expense } from "@/lib/types";
import { formatMoney } from "@/lib/budget-math";
import { store } from "@/hooks/useStore";
import { toast } from "sonner";

function catMeta(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? { emoji: "✨", label: id };
}

export function ExpenseList({
  expenses,
  currency,
  empty,
}: {
  expenses: Expense[];
  currency: string;
  empty?: React.ReactNode;
}) {
  if (expenses.length === 0) {
    return (
      <Card className="border-dashed border-border/70 bg-muted/30 shadow-none">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          {empty ?? "No expenses yet."}
        </CardContent>
      </Card>
    );
  }

  // group by date desc
  const groups = new Map<string, Expense[]>();
  for (const e of [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1))) {
    const arr = groups.get(e.date) ?? [];
    arr.push(e);
    groups.set(e.date, arr);
  }

  return (
    <div className="space-y-4">
      {Array.from(groups.entries()).map(([date, items]) => {
        const dayTotal = items.reduce((s, e) => s + e.amount, 0);
        return (
          <div key={date}>
            <div className="mb-1.5 flex items-center justify-between px-1 text-xs font-medium text-muted-foreground">
              <span>{format(parseISO(date), "EEE, MMM d")}</span>
              <span>{formatMoney(dayTotal, currency)}</span>
            </div>
            <Card className="overflow-hidden shadow-[var(--shadow-card)]">
              <ul className="divide-y divide-border">
                {items.map((e) => {
                  const meta = catMeta(e.category);
                  return (
                    <li key={e.id} className="flex items-center gap-3 p-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-base">
                        {meta.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {e.note || meta.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{meta.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatMoney(e.amount, currency)}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          store.deleteExpense(e.id);
                          toast.success("Expense removed");
                        }}
                        aria-label="Delete expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
