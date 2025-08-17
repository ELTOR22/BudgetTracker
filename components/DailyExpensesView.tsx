import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import { Expense } from "./ExpenseForm";

interface DailyExpensesViewProps {
  expenses: Expense[];
}

export function DailyExpensesView({ expenses }: DailyExpensesViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatAmount = (amount: number) => `₱${amount.toFixed(2)}`;

  const selectedDateString = formatDate(selectedDate);
  const dailyExpenses = expenses.filter(expense => expense.date === selectedDateString);
  const dailyTotal = dailyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Get expenses for the last 7 days for comparison
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return formatDate(date);
  });

  const weeklyData = last7Days.map(date => {
    const dayExpenses = expenses.filter(expense => expense.date === date);
    const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      date,
      total,
      dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
    };
  }).reverse();

  const averageDaily = weeklyData.reduce((sum, day) => sum + day.total, 0) / 7;
  const isAboveAverage = dailyTotal > averageDaily;

  const categoryTotals = dailyExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <h3>Select Date</h3>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            <h3>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{formatAmount(dailyTotal)}</div>
            <p className="text-muted-foreground">Total spent today</p>
          </div>

          <div className="flex items-center justify-center gap-2">
            {isAboveAverage ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-500" />
            )}
            <span className={`text-sm ${isAboveAverage ? 'text-red-500' : 'text-green-500'}`}>
              {isAboveAverage ? 'Above' : 'Below'} 7-day average ({formatAmount(averageDaily)})
            </span>
          </div>

          <div className="space-y-2">
            <h4>Categories Today</h4>
            {Object.entries(categoryTotals).length === 0 ? (
              <p className="text-muted-foreground text-sm">No expenses for this day</p>
            ) : (
              Object.entries(categoryTotals)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <Badge variant="secondary">{category}</Badge>
                    <span className="font-medium">{formatAmount(amount)}</span>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <h3>7-Day Trend</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyData.map((day) => (
              <div key={day.date} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-8">{day.dayName}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-2 bg-primary rounded-full"
                    style={{ 
                      width: `${Math.max(day.total / Math.max(...weeklyData.map(d => d.total)) * 60, 4)}px` 
                    }}
                  />
                  <span className="text-sm font-medium w-20 text-right">
                    {formatAmount(day.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>7-day total:</span>
              <span className="font-medium">
                {formatAmount(weeklyData.reduce((sum, day) => sum + day.total, 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Daily average:</span>
              <span>{formatAmount(averageDaily)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Expenses List */}
      {dailyExpenses.length > 0 && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <h3>Expenses for {selectedDate.toLocaleDateString()}</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{expense.category}</Badge>
                    <span>{expense.description}</span>
                  </div>
                  <span className="font-medium">{formatAmount(expense.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}