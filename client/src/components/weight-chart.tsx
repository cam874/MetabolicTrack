import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { WeightEntry } from "@shared/schema";

interface WeightChartProps {
  weightEntries: WeightEntry[];
  totalLoss: number;
  goalProgress: number;
  goalWeight?: number;
  weightUnit?: string;
}

export default function WeightChart({ weightEntries, totalLoss, goalProgress, goalWeight, weightUnit = "lbs" }: WeightChartProps) {
  // Format data for chart
  const chartData = weightEntries
    .slice()
    .reverse()
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("en-US", { month: "short" }),
      weight: parseFloat(entry.weight),
    }));

  // Calculate goal prediction
  const calculateGoalPrediction = () => {
    if (!goalWeight || weightEntries.length < 2) return null;
    
    const currentWeight = parseFloat(weightEntries[0].weight);
    const remainingWeight = currentWeight - goalWeight;
    
    // Calculate average weekly loss based on recent entries
    const recentEntries = weightEntries.slice(0, Math.min(8, weightEntries.length)); // Last 8 weeks
    if (recentEntries.length < 2) return null;
    
    const weeksBetween = (new Date(recentEntries[0].date).getTime() - new Date(recentEntries[recentEntries.length - 1].date).getTime()) / (1000 * 60 * 60 * 24 * 7);
    const totalLossInPeriod = parseFloat(recentEntries[recentEntries.length - 1].weight) - parseFloat(recentEntries[0].weight);
    const avgWeeklyLoss = Math.abs(totalLossInPeriod / weeksBetween);
    
    if (avgWeeklyLoss <= 0) return null;
    
    const weeksToGoal = Math.ceil(remainingWeight / avgWeeklyLoss);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeksToGoal * 7));
    
    return {
      weeksToGoal,
      targetDate: targetDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      avgWeeklyLoss: avgWeeklyLoss.toFixed(1)
    };
  };

  const goalPrediction = calculateGoalPrediction();

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Weight Progress</h3>
          <button 
            className="text-sm text-primary font-medium"
            data-testid="button-view-details"
          >
            View Details
          </button>
        </div>
        
        {/* Chart Container */}
        <div className="chart-container rounded-lg p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Total Loss</p>
              <p className="text-2xl font-bold" data-testid="text-total-loss">
                -{totalLoss.toFixed(1)} {weightUnit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Goal Progress</p>
              <p className="text-xl font-semibold" data-testid="text-goal-progress">
                {goalProgress}%
              </p>
            </div>
          </div>
          
          {/* Chart Visualization */}
          {chartData.length > 0 && (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }}
                  />
                  <YAxis hide />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="rgba(255,255,255,0.8)" 
                    strokeWidth={2}
                    dot={{ fill: "white", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Goal Prediction */}
          {goalPrediction && (
            <div className="mt-4 p-3 bg-white/20 rounded-lg">
              <p className="text-white/80 text-xs mb-1">Goal Prediction</p>
              <p className="text-white text-sm font-medium" data-testid="text-goal-prediction">
                At {goalPrediction.avgWeeklyLoss} {weightUnit}/week, you'll reach your goal around {goalPrediction.targetDate}
              </p>
              <p className="text-white/60 text-xs mt-1">
                (~{goalPrediction.weeksToGoal} weeks remaining)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
