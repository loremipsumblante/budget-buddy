import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AuthForm } from "@/components/AuthForm";
import { BudgetSummary } from "@/components/BudgetSummary";
import { DailyAllowance } from "@/components/DailyAllowance";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { SmartTips } from "@/components/SmartTips";
import { useActiveBudget, useStore } from "@/hooks/useStore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Pocket" },
      {
        name: "description",
        content: "Your current budget at a glance: remaining money, daily allowance, and tips.",
      },
    ],
  }),
  component: Dashboard,
});

function EmptyState() {
  return (
    <div className="grid place-items-center py-12 gap-10">
      
      {/* 1. Here is your Login / Sign Up Form */}
      <div className="w-full max-w-md">
        <AuthForm />
      </div>

      {/* 2. Here is your original Welcome Card below it */}
      <Card className="max-w-md w-full text-center shadow-[var(--shadow-card)]">
        <CardContent className="space-y-4 p-8">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">Welcome to Pocket</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Set a budget for a week, two weeks, a month, or any range — then track expenses and
              save.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link to="/budget/new">Create your first budget</Link>
          </Button>
        </CardContent>
      </Card>
      
    </div>
  );
}

function Dashboard() {
  const budget = useActiveBudget();
  const { expenses } = useStore();
  const [open, setOpen] = useState(false);

  if (!budget) return <EmptyState />;

  const own = expenses.filter((e) => e.budgetId === budget.id);
  const recent = own.slice(0, 5);

  return (
    <div className="space-y-5">
      <BudgetSummary budget={budget} expenses={expenses} />
      <DailyAllowance budget={budget} expenses={expenses} />

      <div className="grid gap-5 lg:grid-cols-2">
        <SmartTips budget={budget} expenses={expenses} />
        <CategoryBreakdown budget={budget} expenses={expenses} />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent expenses</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/expenses">View all</Link>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
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
          expenses={recent}
          currency={budget.currency}
          empty="No expenses yet — tap Add to log your first one."
        />
      </section>
    </div>
  );
}