import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { WeightEntry } from "@shared/schema";

interface WeightChartProps {
  weightEntries: WeightEntry[];
  totalLoss: number;
  goalProgress: number;
}

export default function WeightChart({ weightEntries, totalLoss, goalProgress }: WeightChartProps) {
  // Format data for chart
  const chartData = weightEntries
    .slice()
    .reverse()
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("en-US", { month: "short" }),
      weight: parseFloat(entry.weight),
    }));

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
                -{totalLoss.toFixed(1)} lbs
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
        </div>
      </CardContent>
    </Card>
  );
}
