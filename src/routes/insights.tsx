import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpendingChart } from "@/components/SpendingChart";
import { CategoryDonut } from "@/components/CategoryDonut";
import { SmartTips } from "@/components/SmartTips";
import { useActiveBudget, useStore } from "@/hooks/useStore";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — Pocket" },
      {
        name: "description",
        content: "See spending patterns and personalized tips to keep your budget on track.",
      },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const budget = useActiveBudget();
  const { expenses } = useStore();

  if (!budget) {
    return (
      <Card className="border-dashed bg-muted/30 shadow-none">
        <CardContent className="space-y-3 p-8 text-center">
          <p className="text-sm text-muted-foreground">Create a budget to unlock insights.</p>
          <Button asChild>
            <Link to="/budget/new">Create budget</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="text-sm text-muted-foreground">
          Where your money goes and how to save more.
        </p>
      </div>
      <SmartTips budget={budget} expenses={expenses} />
      <SpendingChart budget={budget} expenses={expenses} />
      <CategoryDonut budget={budget} expenses={expenses} />
    </div>
  );
}
