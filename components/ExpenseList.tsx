import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Trash2, Filter } from "lucide-react";
import { Expense } from "./ExpenseForm";

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

export function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const categories = [...new Set(expenses.map(expense => expense.category))];
  
  const filteredExpenses = categoryFilter === "all" 
    ? expenses 
    : expenses.filter(expense => expense.category === categoryFilter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3>Recent Expenses</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredExpenses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No expenses found. Add your first expense above.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium">{expense.description}</span>
                    <Badge variant="secondary">{expense.category}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(expense.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{formatAmount(expense.amount)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteExpense(expense.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}