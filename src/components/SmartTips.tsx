import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { generateTips, type Tip } from "@/lib/tips";
import type { Budget, Expense } from "@/lib/types";

const meta: Record<Tip["tone"], { icon: typeof Info; cls: string }> = {
  good: { icon: CheckCircle2, cls: "bg-success/10 text-success" },
  warn: { icon: AlertTriangle, cls: "bg-warning/15 text-warning-foreground" },
  bad: { icon: AlertOctagon, cls: "bg-destructive/10 text-destructive" },
  info: { icon: Info, cls: "bg-accent text-accent-foreground" },
};

export function SmartTips({ budget, expenses }: { budget: Budget; expenses: Expense[] }) {
  const tips = generateTips(budget, expenses);
  if (tips.length === 0) return null;

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardContent className="space-y-3 p-5">
        <div>
          <h3 className="text-sm font-semibold">Smart tips</h3>
          <p className="text-xs text-muted-foreground">
            Personalized suggestions to help you save
          </p>
        </div>
        <ul className="space-y-2.5">
          {tips.map((t) => {
            const m = meta[t.tone];
            const Icon = m.icon;
            return (
              <li key={t.id} className="flex items-start gap-3">
                <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${m.cls}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{t.title}</p>
                  <p className="text-sm text-muted-foreground">{t.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
