import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import { TrendingDown, Target, Camera, Edit3, Trash2 } from "lucide-react";
import type { WeightEntry, InjectionLog } from "@shared/schema";
import { format, addDays, parseISO } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AddEntryDialog from "@/components/add-entry-dialog";

export default function Analytics() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState("import");
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);

  const { data: demoUser } = useQuery({
    queryKey: ["/api/demo-user"],
  });

  const { data: weightEntries } = useQuery({
    queryKey: ["/api/weight-entries", demoUser?.id],
    enabled: !!demoUser?.id,
  });

  const { data: injectionLogs } = useQuery({
    queryKey: ["/api/injection-logs", demoUser?.id],
    enabled: !!demoUser?.id,
  });

  const deleteWeightMutation = useMutation({
    mutationFn: (entryId: string) => apiRequest("DELETE", `/api/weight-entries/${entryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weight-entries"] });
    },
  });

  const deleteInjectionMutation = useMutation({
    mutationFn: (logId: string) => apiRequest("DELETE", `/api/injection-logs/${logId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/injection-logs"] });
    },
  });

  // Calculate progress metrics
  const currentWeight = weightEntries?.[0] ? parseFloat(weightEntries[0].weight) : 0;
  const startWeight = demoUser?.startWeight ? parseFloat(demoUser.startWeight) : 
    (weightEntries?.[weightEntries.length - 1] ? parseFloat(weightEntries[weightEntries.length - 1].weight) : 0);
  const goalWeight = demoUser?.goalWeight ? parseFloat(demoUser.goalWeight) : 0;
  const weightUnit = demoUser?.weightUnit || "lbs";
  const totalLoss = startWeight - currentWeight;
  const goalProgress = goalWeight > 0 ? ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100 : 0;

  // Calculate trajectory and prediction
  const chartData = weightEntries?.slice().reverse().map((entry, index) => ({
    date: format(parseISO(entry.date.toString()), "MMM dd"),
    weight: parseFloat(entry.weight),
    dayIndex: index,
    fullDate: entry.date
  })) || [];

  // Calculate linear regression for trend line
  const calculateTrend = () => {
    if (chartData.length < 2) return { slope: 0, intercept: 0, projectedGoalDate: null };
    
    const n = chartData.length;
    const sumX = chartData.reduce((sum, point) => sum + point.dayIndex, 0);
    const sumY = chartData.reduce((sum, point) => sum + point.weight, 0);
    const sumXY = chartData.reduce((sum, point) => sum + point.dayIndex * point.weight, 0);
    const sumXX = chartData.reduce((sum, point) => sum + point.dayIndex * point.dayIndex, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Project when goal will be reached
    let projectedGoalDate = null;
    if (slope < 0 && goalWeight > 0) { // Only if losing weight
      const daysToGoal = (goalWeight - intercept) / slope;
      if (daysToGoal > 0) {
        const startDate = parseISO(chartData[0].fullDate.toString());
        projectedGoalDate = addDays(startDate, Math.round(daysToGoal));
      }
    }

    return { slope, intercept, projectedGoalDate };
  };

  const { slope, intercept, projectedGoalDate } = calculateTrend();

  // Add trend line to chart data
  const chartDataWithTrend = chartData.map(point => ({
    ...point,
    trend: intercept + slope * point.dayIndex
  }));

  // Recent logs for editing
  const recentWeightEntries = weightEntries?.slice(0, 5) || [];
  const recentInjectionLogs = injectionLogs?.slice(0, 5) || [];

  return (
    <main className="max-w-md mx-auto min-h-screen pb-20 pt-4">
      <div className="px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6" data-testid="title-progress">
          Progress
        </h1>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Current Weight</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-current-weight">
                  {currentWeight ? `${currentWeight} ${weightUnit}` : `-- ${weightUnit}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Lost</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-total-loss">
                  -{totalLoss.toFixed(1)} {weightUnit}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Goal Progress</span>
                <span className="text-sm font-medium">{goalProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(goalProgress, 100)}%` }}
                />
              </div>
              
              {projectedGoalDate && (
                <div className="flex items-center gap-2 pt-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm text-gray-600">
                    Projected goal: <span className="font-medium text-primary">
                      {format(projectedGoalDate, "MMM dd, yyyy")}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weight Progress Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" />
              Weight Trajectory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataWithTrend}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)} ${weightUnit}`,
                      name === 'weight' ? 'Actual Weight' : 'Trend'
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  {goalWeight > 0 && (
                    <ReferenceLine 
                      y={goalWeight} 
                      stroke="#10B981" 
                      strokeDasharray="5 5" 
                      label={{ value: "Goal", position: "left" }}
                    />
                  )}
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#6366F1" 
                    strokeWidth={3}
                    dot={{ fill: "#6366F1", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#6366F1" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="trend" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span>Actual Weight</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-orange-500"></div>
                <span>Trend Line</span>
              </div>
              {goalWeight > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-green-500 border-dashed border border-green-500"></div>
                  <span>Goal</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Import */}
        <div className="mb-6">
          <Button 
            onClick={() => {
              setDialogTab("import");
              setDialogOpen(true);
            }}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            data-testid="button-import-data"
          >
            <Camera className="w-4 h-4 mr-2" />
            Import Screenshot Data
          </Button>
        </div>

        {/* Recent Weight Entries */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Weight Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentWeightEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No weight entries yet</p>
            ) : (
              recentWeightEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{entry.weight} {entry.unit}</p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(entry.date.toString()), "MMM dd, yyyy")}
                    </p>
                    {entry.notes && (
                      <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingEntry(entry);
                        setDialogTab("weight");
                        setDialogOpen(true);
                      }}
                      data-testid={`button-edit-weight-${entry.id}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteWeightMutation.mutate(entry.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`button-delete-weight-${entry.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Injection Logs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Injections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentInjectionLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No injection logs yet</p>
            ) : (
              recentInjectionLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{log.injectionSite}</Badge>
                      <span className="text-sm font-medium">{log.dosage}mg</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(log.injectionDate.toString()), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                    {log.notes && (
                      <p className="text-xs text-gray-500 mt-1">{log.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteInjectionMutation.mutate(log.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`button-delete-injection-${log.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Add Entry Dialog */}
        <AddEntryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          defaultTab={dialogTab}
        />
      </div>
    </main>
  );
}