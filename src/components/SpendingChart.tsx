import { eachDayOfInterval, format, parseISO, startOfDay } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Budget, Expense } from "@/lib/types";

const config: ChartConfig = {
  spent: { label: "Spent", color: "var(--primary)" },
};

export function SpendingChart({ budget, expenses }: { budget: Budget; expenses: Expense[] }) {
  const days = eachDayOfInterval({
    start: parseISO(budget.startDate),
    end: parseISO(budget.endDate),
  });
  const own = expenses.filter((e) => e.budgetId === budget.id);
  const data = days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const spent = own
      .filter((e) => format(startOfDay(parseISO(e.date)), "yyyy-MM-dd") === key)
      .reduce((s, e) => s + e.amount, 0);
    return { day: format(d, "MMM d"), spent: Math.round(spent * 100) / 100 };
  });

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardContent className="space-y-3 p-5">
        <div>
          <h3 className="text-sm font-semibold">Daily spending</h3>
          <p className="text-xs text-muted-foreground">Across the budget period</p>
        </div>
        <ChartContainer config={config} className="aspect-[16/9] w-full">
          <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              minTickGap={20}
            />
            <YAxis tickLine={false} axisLine={false} width={36} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="spent" fill="var(--color-spent)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
