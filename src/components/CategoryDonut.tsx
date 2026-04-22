import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CATEGORIES } from "@/lib/types";
import type { Budget, Expense } from "@/lib/types";
import { formatMoney, spentByCategory } from "@/lib/budget-math";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary-glow)",
  "var(--muted-foreground)",
];

export function CategoryDonut({ budget, expenses }: { budget: Budget; expenses: Expense[] }) {
  const own = expenses.filter((e) => e.budgetId === budget.id);
  const totals = spentByCategory(own);
  const data = CATEGORIES.map((c, i) => ({
    name: c.label,
    value: Math.round((totals[c.id] ?? 0) * 100) / 100,
    fill: PALETTE[i % PALETTE.length],
  })).filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.name, { label: d.name, color: PALETTE[i % PALETTE.length] }]),
  );

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardContent className="space-y-3 p-5">
        <div>
          <h3 className="text-sm font-semibold">By category</h3>
          <p className="text-xs text-muted-foreground">
            {total > 0
              ? `Total ${formatMoney(total, budget.currency)}`
              : "Add expenses to see the split"}
          </p>
        </div>
        {data.length > 0 ? (
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <ChartContainer config={config} className="aspect-square h-48 w-48">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80}>
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.fill} stroke="var(--background)" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="flex-1 space-y-1.5 text-sm">
              {data.map((d) => (
                <li key={d.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: d.fill }}
                    />
                    {d.name}
                  </span>
                  <span className="text-muted-foreground">
                    {formatMoney(d.value, budget.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid h-32 place-items-center text-sm text-muted-foreground">
            No spending yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
