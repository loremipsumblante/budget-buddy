import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { CATEGORIES, type Category } from "@/lib/types";
import { useActiveBudget, useStore } from "@/hooks/useStore";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — Pocket" },
      { name: "description", content: "Log and review every expense in your active budget." },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const budget = useActiveBudget();
  const { expenses } = useStore();
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    if (!budget) return [];
    let items = expenses.filter((e) => e.budgetId === budget.id);
    if (filter !== "all") items = items.filter((e) => e.category === filter);
    return items;
  }, [budget, expenses, filter]);

  if (!budget) {
    return (
      <Card className="border-dashed bg-muted/30 shadow-none">
        <CardContent className="space-y-3 p-8 text-center">
          <p className="text-sm text-muted-foreground">Create a budget to start logging expenses.</p>
          <Button asChild>
            <Link to="/budget/new">Create budget</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Logged against <span className="font-medium text-foreground">{budget.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm budgetId={budget.id} onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ExpenseList
        expenses={list}
        currency={budget.currency}
        empty={
          filter === "all"
            ? "No expenses yet — tap Add to log your first one."
            : "No expenses in this category yet."
        }
      />
    </div>
  );
}
