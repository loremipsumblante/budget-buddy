

## Expense Tracker with Budget Saving Goals

A clean, friendly app that helps you set a budget for any period (week, 2 weeks, month, or custom), log expenses, and stay on track with daily allowances and category limits.

### Defaults I picked for you
- **No login** — works instantly, data saved in your browser. Easy to add accounts later.
- **All period options** — weekly, bi-weekly, monthly, plus custom dates.
- **Saving help** — daily allowance + category limits + savings goal + smart tips.
- **Style** — clean and modern with a soft accent color, rounded cards, friendly feel.

### Pages

```text
/                  Dashboard — current budget overview
/budget/new        Create a new budget
/expenses          All expenses (add, edit, delete, filter)
/insights          Charts & smart tips
```

A simple top nav links between them. Mobile-friendly (your viewport is narrow).

### Dashboard (home)
- Current budget header: name, period, days left
- Big number: amount remaining
- Progress bar: spent vs total
- **Daily allowance card**: "You can spend $X/day to stay on track"
- **Today's pace**: green/amber/red based on whether you're ahead or behind
- Category breakdown with mini progress bars (each category vs its limit)
- Savings goal progress (if set)
- Recent expenses (last 5) + "Add expense" quick button

### Create budget flow
- Name, total amount, currency symbol
- Period: Weekly / 2 weeks / Monthly / Custom dates
- Optional savings goal (amount to set aside)
- Optional category limits (food, transport, shopping, bills, entertainment, other) — pre-filled suggestions

### Expenses page
- Add expense: amount, category, note, date
- List grouped by day, with running totals
- Filter by category, edit/delete via row actions

### Insights page
- Spend-by-category donut chart (recharts)
- Daily spending bar chart across the period
- **Smart tips** generated from data, e.g.:
  - "You're 18% over your food limit — try capping at $X this week"
  - "At current pace you'll overshoot by $Y. Cut $Z/day to recover."
  - "You're saving ahead of plan — nice work."

### Storage
- Browser `localStorage` keyed `expense-tracker:v1`
- Shape: `{ budgets: Budget[], expenses: Expense[], activeBudgetId }`
- All reads/writes through a small `useStore` hook so we can swap to a backend later without rewriting components

### Visual style
- Light background, soft slate text
- Single accent color (emerald green for "on track", amber for "watch", red for "over")
- Rounded cards, subtle shadows, generous spacing
- shadcn components: Card, Button, Input, Tabs, Progress, Table, Dialog, Select, Calendar (date picker), Sonner (toasts)

### Technical structure

```text
src/
  routes/
    __root.tsx         (add nav header + Toaster)
    index.tsx          (Dashboard)
    budget.new.tsx     (Create budget form)
    expenses.tsx       (Expense list + add dialog)
    insights.tsx       (Charts + tips)
  components/
    BudgetSummary.tsx
    DailyAllowance.tsx
    CategoryBreakdown.tsx
    ExpenseForm.tsx
    ExpenseList.tsx
    SpendingChart.tsx
    CategoryDonut.tsx
    SmartTips.tsx
    Header.tsx
  lib/
    types.ts           (Budget, Expense, Category)
    storage.ts         (localStorage read/write)
    budget-math.ts     (daily allowance, pace, projections)
    tips.ts            (smart tip generator)
  hooks/
    useStore.ts        (reactive store with subscribe)
```

- TanStack Router file-based routes, each with proper `head()` metadata
- Date math via `date-fns` (already in shadcn ecosystem)
- Charts via `recharts` (already wired in `chart.tsx`)
- All money displayed with `Intl.NumberFormat`
- Empty state on first visit: friendly hero + "Create your first budget" CTA

### What's NOT in v1 (easy to add later)
- User accounts / cloud sync
- Recurring expenses
- Multiple simultaneous budgets (you'll have one active budget; old ones archive)
- Income tracking (focus is spending vs budget)

If you want any of those in v1, say the word and I'll fold them in. Otherwise approve and I'll build it.

