import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { WeightEntry, InjectionLog } from "@shared/schema";

export default function Analytics() {
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

  // Prepare weight loss data by month
  const monthlyData = weightEntries?.reduce((acc: any[], entry: WeightEntry) => {
    const month = new Date(entry.date).toLocaleDateString("en-US", { month: "short" });
    const weight = parseFloat(entry.weight);
    
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.weights.push(weight);
    } else {
      acc.push({ month, weights: [weight] });
    }
    return acc;
  }, []).map(item => ({
    month: item.month,
    avgWeight: item.weights.reduce((sum: number, w: number) => sum + w, 0) / item.weights.length,
    loss: item.weights[0] - item.weights[item.weights.length - 1]
  })) || [];

  // Injection frequency data
  const injectionSites = injectionLogs?.reduce((acc: Record<string, number>, log: InjectionLog) => {
    const site = log.injectionSite || "Unknown";
    acc[site] = (acc[site] || 0) + 1;
    return acc;
  }, {}) || {};

  const siteData = Object.entries(injectionSites).map(([site, count]) => ({
    site: site.charAt(0).toUpperCase() + site.slice(1),
    count
  }));

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];

  const currentWeight = weightEntries?.[0] ? parseFloat(weightEntries[0].weight) : 0;
  const startWeight = weightEntries?.[weightEntries.length - 1] ? parseFloat(weightEntries[weightEntries.length - 1].weight) : 0;
  const totalLoss = startWeight - currentWeight;
  const avgWeeklyLoss = totalLoss / (weightEntries?.length || 1);

  return (
    <main className="max-w-md mx-auto min-h-screen pb-20 pt-4">
      <div className="px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6" data-testid="title-analytics">
          Analytics
        </h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary" data-testid="stat-total-loss">
                  {totalLoss.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Total Loss (lbs)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary" data-testid="stat-weekly-avg">
                  {avgWeeklyLoss.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Avg Weekly Loss</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent" data-testid="stat-injection-count">
                  {injectionLogs?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Total Injections</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600" data-testid="stat-days-active">
                  {weightEntries?.length ? weightEntries.length * 7 : 0}
                </p>
                <p className="text-sm text-gray-600">Days Active</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weight Loss Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Monthly Weight Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Bar dataKey="loss" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Injection Sites */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Injection Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={siteData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="count"
                    label={({ site, count }) => `${site}: ${count}`}
                  >
                    {siteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Progress Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">Great Progress!</p>
                <p className="text-sm text-green-700">You're losing weight consistently</p>
              </div>
              <i className="fas fa-chart-line text-green-600"></i>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Consistent Dosing</p>
                <p className="text-sm text-blue-700">Your injection schedule is on track</p>
              </div>
              <i className="fas fa-syringe text-blue-600"></i>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-orange-900">Goal Achievement</p>
                <p className="text-sm text-orange-700">79% towards your target weight</p>
              </div>
              <i className="fas fa-target text-orange-600"></i>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
