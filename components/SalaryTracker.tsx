import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Edit2, Check, X, Wallet, TrendingUp, Calendar } from "lucide-react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SalaryData {
  monthly: number;
  lastUpdated: string | null;
}

interface SalaryTrackerProps {
  userId: string;
  monthlyExpenses: number;
}

export function SalaryTracker({ userId, monthlyExpenses }: SalaryTrackerProps) {
  const [salaryData, setSalaryData] = useState<SalaryData>({ monthly: 50000, lastUpdated: null });
  const [isEditing, setIsEditing] = useState(false);
  const [salaryInput, setSalaryInput] = useState("");
  const [loading, setLoading] = useState(true);

  const formatAmount = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  useEffect(() => {
    fetchSalaryData();
  }, [userId]);

  const fetchSalaryData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e9abf6d/salary/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setSalaryData(result.salary);
        setSalaryInput(result.salary.monthly.toString());
      }
    } catch (error) {
      console.error('Error fetching salary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSalary = async () => {
    const newSalary = parseFloat(salaryInput);
    if (newSalary <= 0) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e9abf6d/salary/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ monthly: newSalary }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setSalaryData(prev => ({ ...prev, monthly: newSalary }));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating salary:', error);
    }
  };

  const handleCancelEdit = () => {
    setSalaryInput(salaryData.monthly.toString());
    setIsEditing(false);
  };

  const remainingAfterExpenses = salaryData.monthly - monthlyExpenses;
  const expensePercentage = (monthlyExpenses / salaryData.monthly) * 100;
  const savingsRate = (remainingAfterExpenses / salaryData.monthly) * 100;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h4>Monthly Salary</h4>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="salary">Monthly Salary (₱)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  placeholder="Enter monthly salary"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={updateSalary} size="sm" className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancelEdit} variant="outline" size="sm" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{formatAmount(salaryData.monthly)}</span>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Gross monthly income
              </p>
              {salaryData.lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(salaryData.lastUpdated).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h4>Income Analysis</h4>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Expenses vs Income</span>
              <span>{expensePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={expensePercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Monthly Expenses:</span>
              <span className="text-sm font-medium text-red-600">
                -{formatAmount(monthlyExpenses)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Remaining:</span>
              <span className={`text-sm font-medium ${remainingAfterExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(remainingAfterExpenses)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Savings Rate:</span>
              <span className={`text-sm font-medium ${savingsRate >= 20 ? 'text-green-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                {savingsRate.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {savingsRate >= 20 
                ? "Great savings rate! You're on track for financial goals." 
                : savingsRate >= 10 
                ? "Good savings rate. Consider reducing expenses to save more." 
                : "Low savings rate. Review your budget to increase savings."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}