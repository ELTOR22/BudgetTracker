import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Moon, Sun, TrendingUp, Calendar, PiggyBank, Wallet } from "lucide-react";
import { ExpenseForm, Expense } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import { MonthlyChart } from "./components/MonthlyChart";
import { BudgetSummary } from "./components/BudgetSummary";
import { DailyExpensesView } from "./components/DailyExpensesView";
import { SalaryTracker } from "./components/SalaryTracker";
import { SavingsTracker } from "./components/SavingsTracker";
import { projectId, publicAnonKey } from './utils/supabase/info';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userId] = useState("demo-user-001"); // In a real app, this would come from authentication

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('budget-tracker-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  // Load expenses from server
  useEffect(() => {
    fetchExpenses();
  }, [userId]);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e9abf6d/expenses/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setExpenses(result.expenses);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      // Load sample data if server fails
      loadSampleData();
    }
  };

  const loadSampleData = () => {
    const sampleExpenses: Expense[] = [
      {
        id: '1',
        amount: 2450.50,
        description: 'Grocery shopping at SM',
        category: 'Food & Dining',
        date: '2024-12-15'
      },
      {
        id: '2',
        amount: 1200.00,
        description: 'Gasoline',
        category: 'Transportation',
        date: '2024-12-14'
      },
      {
        id: '3',
        amount: 549.00,
        description: 'Netflix subscription',
        category: 'Entertainment',
        date: '2024-12-13'
      },
      {
        id: '4',
        amount: 3850.00,
        description: 'Electric bill',
        category: 'Bills & Utilities',
        date: '2024-12-12'
      },
      {
        id: '5',
        amount: 2890.00,
        description: 'Dinner at Jollibee',
        category: 'Food & Dining',
        date: '2024-12-11'
      },
      {
        id: '6',
        amount: 850.00,
        description: 'Jeepney fare',
        category: 'Transportation',
        date: '2024-12-10'
      },
      {
        id: '7',
        amount: 1650.00,
        description: 'Coffee shop',
        category: 'Food & Dining',
        date: '2024-12-09'
      }
    ];
    setExpenses(sampleExpenses);
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e9abf6d/expenses/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(expenseData),
        }
      );

      const result = await response.json();
      if (result.success) {
        const newExpense: Expense = {
          ...expenseData,
          id: result.id
        };
        setExpenses(prev => [newExpense, ...prev]);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      // Fallback to local state
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      };
      setExpenses(prev => [newExpense, ...prev]);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e9abf6d/expenses/${userId}/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      // Fallback to local state
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('budget-tracker-theme', newIsDark ? 'dark' : 'light');
  };

  // Calculate monthly expenses for current month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses
    .filter(expense => expense.date.startsWith(currentMonth))
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Budget Tracker
            </h1>
            <p className="text-muted-foreground">Manage your finances with Philippine Peso (₱)</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center gap-2"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? 'Light' : 'Dark'} Mode
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="salary" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Salary
            </TabsTrigger>
            <TabsTrigger value="savings" className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4" />
              Savings
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              Manage
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <BudgetSummary expenses={expenses} />
            <MonthlyChart expenses={expenses} />
          </TabsContent>

          {/* Daily Expenses Tab */}
          <TabsContent value="daily" className="space-y-6">
            <DailyExpensesView expenses={expenses} />
          </TabsContent>

          {/* Salary Tab */}
          <TabsContent value="salary" className="space-y-6">
            <SalaryTracker userId={userId} monthlyExpenses={monthlyExpenses} />
          </TabsContent>

          {/* Savings Tab */}
          <TabsContent value="savings" className="space-y-6">
            <SavingsTracker userId={userId} />
          </TabsContent>

          {/* Manage Expenses Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseForm onAddExpense={addExpense} />
              <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}