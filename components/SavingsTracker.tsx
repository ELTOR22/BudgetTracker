import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { PiggyBank, Target, Plus, Minus, Edit2, Check, X } from "lucide-react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SavingsData {
  goal: number;
  current: number;
  lastUpdated: string | null;
}

interface SavingsTrackerProps {
  userId: string;
}

export function SavingsTracker({ userId }: SavingsTrackerProps) {
  const [savingsData, setSavingsData] = useState<SavingsData>({ goal: 100000, current: 0, lastUpdated: null });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [loading, setLoading] = useState(true);

  const formatAmount = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  useEffect(() => {
    fetchSavingsData();
  }, [userId]);

  const fetchSavingsData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e9abf6d/savings/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setSavingsData(result.savings);
        setGoalInput(result.savings.goal.toString());
      }
    } catch (error) {
      console.error('Error fetching savings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSavingsData = async (updates: Partial<SavingsData>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0e9abf6d/savings/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...savingsData, ...updates }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setSavingsData(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error('Error updating savings data:', error);
    }
  };

  const updateGoal = async () => {
    const newGoal = parseFloat(goalInput);
    if (newGoal <= 0) return;

    await updateSavingsData({ goal: newGoal });
    setIsEditingGoal(false);
  };

  const addToSavings = async () => {
    const amount = parseFloat(amountInput);
    if (amount <= 0) return;

    const newCurrent = savingsData.current + amount;
    await updateSavingsData({ current: newCurrent });
    setAmountInput("");
  };

  const withdrawFromSavings = async () => {
    const amount = parseFloat(amountInput);
    if (amount <= 0) return;

    const newCurrent = Math.max(0, savingsData.current - amount);
    await updateSavingsData({ current: newCurrent });
    setAmountInput("");
  };

  const handleCancelGoalEdit = () => {
    setGoalInput(savingsData.goal.toString());
    setIsEditingGoal(false);
  };

  const progressPercentage = (savingsData.current / savingsData.goal) * 100;
  const remainingToGoal = savingsData.goal - savingsData.current;

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Savings Goal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h4>Savings Goal</h4>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isEditingGoal ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="goal">Savings Goal (₱)</Label>
                <Input
                  id="goal"
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="Enter savings goal"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={updateGoal} size="sm" className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancelGoalEdit} variant="outline" size="sm" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{formatAmount(savingsData.goal)}</span>
                <Button variant="ghost" size="sm" onClick={() => setIsEditingGoal(true)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-medium text-green-600">{formatAmount(savingsData.current)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium">{formatAmount(Math.max(0, remainingToGoal))}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Savings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h4>Current Savings</h4>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{formatAmount(savingsData.current)}</div>
            <p className="text-muted-foreground text-sm">Total saved</p>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="amount">Amount (₱)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={addToSavings} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
              <Button onClick={withdrawFromSavings} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                <Minus className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </div>

          {savingsData.lastUpdated && (
            <p className="text-xs text-muted-foreground text-center">
              Last updated: {new Date(savingsData.lastUpdated).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Savings Insights */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <h4>Savings Insights</h4>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {progressPercentage >= 100 ? "🎉 Goal Achieved!" : `${progressPercentage.toFixed(0)}%`}
              </div>
              <p className="text-sm text-muted-foreground">Goal Progress</p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {remainingToGoal > 0 ? Math.ceil(remainingToGoal / 5000) : 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Months to goal<br/>(₱5k/month)
              </p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {savingsData.goal > 0 ? ((savingsData.current / savingsData.goal) * 100).toFixed(0) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Achievement Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}