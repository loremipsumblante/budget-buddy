import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { addDays, addMonths, format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type Category, type PeriodPreset } from "@/lib/types";
import { store } from "@/hooks/useStore";

export const Route = createFileRoute("/budget/new")({
  head: () => ({
    meta: [
      { title: "Create a budget — Pocket" },
      {
        name: "description",
        content:
          "Create a weekly, bi-weekly, monthly, or custom budget. Set a savings goal and category limits.",
      },
    ],
  }),
  component: NewBudget,
});

function NewBudget() {
  const navigate = useNavigate();
  const [name, setName] = useState("My budget");
  const [total, setTotal] = useState("500");
  const [currency, setCurrency] = useState("$");
  const [preset, setPreset] = useState<PeriodPreset>("weekly");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 6), "yyyy-MM-dd"));
  const [savings, setSavings] = useState("");
  const [limits, setLimits] = useState<Partial<Record<Category, string>>>({});

  const computedEnd = useMemo(() => {
    if (preset === "custom") return endDate;
    const start = new Date(startDate);
    if (preset === "weekly") return format(addDays(start, 6), "yyyy-MM-dd");
    if (preset === "biweekly") return format(addDays(start, 13), "yyyy-MM-dd");
    return format(addDays(addMonths(start, 1), -1), "yyyy-MM-dd");
  }, [preset, startDate, endDate]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(total);
    if (!num || num <= 0) {
      toast.error("Enter a valid total amount");
      return;
    }
    const finalEnd = preset === "custom" ? endDate : computedEnd;
    if (finalEnd < startDate) {
      toast.error("End date must be after the start date");
      return;
    }
    const categoryLimits: Partial<Record<Category, number>> = {};
    for (const [k, v] of Object.entries(limits)) {
      const n = parseFloat(v ?? "");
      if (n > 0) categoryLimits[k as Category] = n;
    }
    const budget = store.addBudget({
      name: name.trim() || "Budget",
      total: num,
      currency: currency || "$",
      startDate,
      endDate: finalEnd,
      preset,
      savingsGoal: savings ? parseFloat(savings) || undefined : undefined,
      categoryLimits,
    });
    toast.success(`Budget "${budget.name}" created`);
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create a budget</h1>
        <p className="text-sm text-muted-foreground">
          Pick a period, set a total, and we'll do the math.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="space-y-4 p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="w-24 space-y-1.5">
                <Label htmlFor="currency">Symbol</Label>
                <Input
                  id="currency"
                  value={currency}
                  maxLength={3}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="total">Total amount</Label>
              <Input
                id="total"
                inputMode="decimal"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Period</Label>
              <Select value={preset} onValueChange={(v) => setPreset(v as PeriodPreset)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">1 week</SelectItem>
                  <SelectItem value="biweekly">2 weeks</SelectItem>
                  <SelectItem value="monthly">1 month</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start">Start date</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end">End date</Label>
                <Input
                  id="end"
                  type="date"
                  value={preset === "custom" ? endDate : computedEnd}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={preset !== "custom"}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="savings">Savings goal (optional)</Label>
              <Input
                id="savings"
                inputMode="decimal"
                placeholder="0.00"
                value={savings}
                onChange={(e) => setSavings(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Money you want to set aside before spending.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="space-y-3 p-5">
            <div>
              <h2 className="text-sm font-semibold">Category limits (optional)</h2>
              <p className="text-xs text-muted-foreground">
                Set caps to get warnings as you approach them.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CATEGORIES.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <Label htmlFor={`limit-${c.id}`} className="flex w-32 items-center gap-1.5 text-sm">
                    <span aria-hidden>{c.emoji}</span> {c.label}
                  </Label>
                  <Input
                    id={`limit-${c.id}`}
                    inputMode="decimal"
                    placeholder="—"
                    value={limits[c.id] ?? ""}
                    onChange={(e) =>
                      setLimits((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/" })}>
            Cancel
          </Button>
          <Button type="submit">Create budget</Button>
        </div>
      </form>
    </div>
  );
}
