import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Edit2, Check, X, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Expense } from "./ExpenseForm";

interface BudgetSummaryProps {
  expenses: Expense[];
}

export function BudgetSummary({ expenses }: BudgetSummaryProps) {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(35000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  const currentMonthExpenses = expenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  );

  const totalThisMonth = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = monthlyBudget - totalThisMonth;
  const budgetProgress = (totalThisMonth / monthlyBudget) * 100;

  const handleSaveBudget = () => {
    const newBudget = parseFloat(budgetInput);
    if (newBudget > 0) {
      setMonthlyBudget(newBudget);
      setIsEditingBudget(false);
    }
  };

  const handleCancelEdit = () => {
    setBudgetInput(monthlyBudget.toString());
    setIsEditingBudget(false);
  };

  const formatAmount = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h4>Monthly Budget</h4>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isEditingBudget ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="budget" className="sr-only">Budget Amount</Label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₱</span>
                  <Input
                    id="budget"
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveBudget} size="sm" className="flex-1">
                  <Check className="w-4 h-4" />
                </Button>
                <Button onClick={handleCancelEdit} variant="outline" size="sm" className="flex-1">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">{formatAmount(monthlyBudget)}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditingBudget(true)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Monthly spending limit
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h4>Spent This Month</h4>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <span className="text-2xl font-bold text-orange-600">{formatAmount(totalThisMonth)}</span>
            <Progress value={budgetProgress} className="w-full h-3" />
            <p className="text-muted-foreground text-sm">
              {budgetProgress.toFixed(1)}% of budget used
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h4>Remaining Budget</h4>
          <TrendingDown className={`h-4 w-4 ${remainingBudget >= 0 ? 'text-green-500' : 'text-red-500'}`} />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <span className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(remainingBudget)}
            </span>
            <p className="text-muted-foreground text-sm">
              {remainingBudget >= 0 ? 'Available to spend' : 'Over budget'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}