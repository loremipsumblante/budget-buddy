import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type Category } from "@/lib/types";
import { store } from "@/hooks/useStore";

export function ExpenseForm({
  budgetId,
  onDone,
}: {
  budgetId: string;
  onDone?: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    store.addExpense({ budgetId, amount: num, category, note: note.trim(), date });
    toast.success("Expense added");
    setAmount("");
    setNote("");
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="mr-2">{c.emoji}</span>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          placeholder="Coffee, groceries..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">
        Add expense
      </Button>
    </form>
  );
}
