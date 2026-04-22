import type { Budget, Category, Expense } from "./types";
import { CATEGORIES } from "./types";
import {
  daysElapsed,
  daysRemaining,
  formatMoney,
  paceStatus,
  spentByCategory,
  spentInRange,
  totalDays,
} from "./budget-math";

export interface Tip {
  id: string;
  tone: "good" | "warn" | "bad" | "info";
  title: string;
  body: string;
}

export function generateTips(budget: Budget, expenses: Expense[]): Tip[] {
  const tips: Tip[] = [];
  const spent = spentInRange(budget, expenses);
  const remaining = budget.total - spent;
  const left = daysRemaining(budget) || 1;
  const elapsed = daysElapsed(budget) || 1;
  const total = totalDays(budget);
  const pace = paceStatus(budget, expenses);
  const projection = (spent / elapsed) * total;
  const cur = budget.currency;

  if (pace.label === "on-track") {
    tips.push({
      id: "pace-good",
      tone: "good",
      title: "You're on track",
      body: `Spending is ${formatMoney(pace.expected - spent, cur)} below the expected pace. Keep it up!`,
    });
  } else if (pace.label === "watch") {
    tips.push({
      id: "pace-watch",
      tone: "warn",
      title: "Close to the line",
      body: `You're slightly above pace. Try to stay near ${formatMoney(remaining / left, cur)}/day to finish on budget.`,
    });
  } else {
    const overshoot = projection - budget.total;
    const cutPerDay = overshoot / left;
    tips.push({
      id: "pace-over",
      tone: "bad",
      title: "Spending faster than budget",
      body: `At this pace you'll overshoot by ${formatMoney(overshoot, cur)}. Cut about ${formatMoney(cutPerDay, cur)}/day to recover.`,
    });
  }

  // category limits
  const byCat = spentByCategory(expenses.filter((e) => e.budgetId === budget.id));
  for (const [cat, limit] of Object.entries(budget.categoryLimits)) {
    if (!limit) continue;
    const used = byCat[cat] ?? 0;
    const ratio = used / limit;
    const label = CATEGORIES.find((c) => c.id === (cat as Category))?.label ?? cat;
    if (ratio >= 1) {
      tips.push({
        id: `cat-${cat}-over`,
        tone: "bad",
        title: `${label} is over limit`,
        body: `You've spent ${formatMoney(used, cur)} of a ${formatMoney(limit, cur)} cap. Pause non-essentials in this category.`,
      });
    } else if (ratio >= 0.8) {
      tips.push({
        id: `cat-${cat}-warn`,
        tone: "warn",
        title: `${label} nearing its cap`,
        body: `${Math.round(ratio * 100)}% of your ${label.toLowerCase()} limit used. ${formatMoney(limit - used, cur)} left.`,
      });
    }
  }

  // savings
  if (budget.savingsGoal && budget.savingsGoal > 0) {
    const projectedRemaining = budget.total - projection;
    if (projectedRemaining >= budget.savingsGoal) {
      tips.push({
        id: "savings-good",
        tone: "good",
        title: "Savings goal on track",
        body: `Projected to save ${formatMoney(projectedRemaining, cur)} — your goal is ${formatMoney(budget.savingsGoal, cur)}.`,
      });
    } else {
      const gap = budget.savingsGoal - projectedRemaining;
      tips.push({
        id: "savings-risk",
        tone: "warn",
        title: "Savings goal at risk",
        body: `You'll fall ${formatMoney(gap, cur)} short. Trim ${formatMoney(gap / left, cur)}/day to hit your goal.`,
      });
    }
  }

  // largest category suggestion
  const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && pace.label !== "on-track") {
    const [topCat, topAmt] = sorted[0];
    const label = CATEGORIES.find((c) => c.id === (topCat as Category))?.label ?? topCat;
    if (topAmt / Math.max(1, spent) > 0.3) {
      tips.push({
        id: `top-${topCat}`,
        tone: "info",
        title: `${label} is your biggest cost`,
        body: `${label} accounts for ${Math.round((topAmt / spent) * 100)}% of spending. Cutting it 20% would save ${formatMoney(topAmt * 0.2, cur)}.`,
      });
    }
  }

  return tips;
}
