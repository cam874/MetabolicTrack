import { useQuery } from "@tanstack/react-query";
import { Camera, Plus, Syringe, Bell, UserCircle, ChevronRight } from "lucide-react";
import WeightChart from "@/components/weight-chart";
import UploadArea from "@/components/upload-area";
import InjectionCounter from "@/components/injection-counter";
import MedicationTracker from "@/components/medication-tracker";

export default function Home() {
  const { data: demoUser } = useQuery({
    queryKey: ["/api/demo-user"],
  });

  const { data: latestWeight } = useQuery({
    queryKey: ["/api/weight-entries", demoUser?.id, "latest"],
    enabled: !!demoUser?.id,
  });

  const { data: weightEntries } = useQuery({
    queryKey: ["/api/weight-entries", demoUser?.id],
    enabled: !!demoUser?.id,
  });

  const { data: injectionCount } = useQuery({
    queryKey: ["/api/injection-logs", demoUser?.id, "count"],
    enabled: !!demoUser?.id,
  });

  const currentWeight = latestWeight?.weight ? parseFloat(latestWeight.weight) : 0;
  const startWeight = weightEntries?.[weightEntries.length - 1]?.weight ? parseFloat(weightEntries[weightEntries.length - 1].weight) : 0;
  const totalLoss = startWeight - currentWeight;
  const monthlyLoss = 8.2; // Mock calculation

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <main className="max-w-md mx-auto min-h-screen pb-20">
      {/* Mobile Navigation */}
      <nav className="glass-effect border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-white text-sm"></i>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">MedTrack Pro</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 text-gray-600 hover:text-primary transition-colors"
                data-testid="button-notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button 
                className="p-2 text-gray-600 hover:text-primary transition-colors"
                data-testid="button-profile"
              >
                <UserCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Welcome Header */}
      <div className="px-4 py-6 bg-gradient-to-br from-primary to-purple-600 text-white">
        <div className="animate-fade-in">
          <h2 className="text-xl font-semibold mb-1" data-testid="text-greeting">
            {greeting}, {demoUser?.firstName || "User"}!
          </h2>
          <p className="text-indigo-100 text-sm">Track your weight loss journey with precision</p>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-xs font-medium">Current Weight</p>
                <p className="text-white text-lg font-bold" data-testid="text-current-weight">
                  {currentWeight ? `${currentWeight} lbs` : "-- lbs"}
                </p>
              </div>
              <i className="fas fa-weight text-indigo-200"></i>
            </div>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-xs font-medium">Lost This Month</p>
                <p className="text-white text-lg font-bold" data-testid="text-monthly-loss">
                  -{monthlyLoss} lbs
                </p>
              </div>
              <i className="fas fa-arrow-down text-green-300"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          
          {/* Screenshot Upload Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Import from Screenshot</h4>
                <p className="text-sm text-gray-500">Upload your current app's progress</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Manual Weight Entry */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Log Weight</h4>
                <p className="text-sm text-gray-500">Quick manual entry</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Injection Counter */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Syringe className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Injection Counter</h4>
                <p className="text-sm text-gray-500">Track your medication doses</p>
              </div>
              <div className="bg-accent text-white text-xs px-2 py-1 rounded-full font-medium" data-testid="text-injection-count">
                {injectionCount?.count || 0}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Progress Chart */}
      <div className="px-4 py-2">
        <WeightChart 
          weightEntries={weightEntries || []} 
          totalLoss={totalLoss}
          goalProgress={79} // Mock goal progress
        />
      </div>

      {/* Medication Tracker */}
      <div className="px-4 py-2">
        <MedicationTracker userId={demoUser?.id || ""} />
      </div>

      {/* Screenshot Upload */}
      <div className="px-4 py-2 mb-6">
        <UploadArea userId={demoUser?.id || ""} />
      </div>

      {/* Injection Counter */}
      <div className="px-4 py-2 mb-6">
        <InjectionCounter userId={demoUser?.id || ""} />
      </div>

    </main>
  );
}
