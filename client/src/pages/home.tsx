import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Camera, Plus, Syringe, Bell, UserCircle, ChevronRight } from "lucide-react";
import WeightChart from "@/components/weight-chart";
import UploadArea from "@/components/upload-area";
import InjectionCounter from "@/components/injection-counter";
import MedicationTracker from "@/components/medication-tracker";
import AddEntryDialog from "@/components/add-entry-dialog";

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState("weight");

  // Listen for add dialog events from navigation
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent) => {
      setDialogTab(event.detail.tab || "weight");
      setDialogOpen(true);
    };

    window.addEventListener('openAddDialog', handleOpenDialog as EventListener);
    return () => {
      window.removeEventListener('openAddDialog', handleOpenDialog as EventListener);
    };
  }, []);
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
  const startWeight = demoUser?.startWeight ? parseFloat(demoUser.startWeight) : 
    (weightEntries?.[weightEntries.length - 1]?.weight ? parseFloat(weightEntries[weightEntries.length - 1].weight) : 0);
  const goalWeight = demoUser?.goalWeight ? parseFloat(demoUser.goalWeight) : 0;
  const weightUnit = demoUser?.weightUnit || "lbs";
  const totalLoss = startWeight - currentWeight;
  
  // Calculate monthly loss from recent entries
  const monthlyLoss = (() => {
    if (!weightEntries || weightEntries.length < 2) return 0;
    const recentEntries = weightEntries.slice(0, 4); // Last 4 entries
    const firstWeight = parseFloat(recentEntries[recentEntries.length - 1].weight);
    const lastWeight = parseFloat(recentEntries[0].weight);
    return firstWeight - lastWeight;
  })();

  const goalProgress = goalWeight > 0 ? Math.round(((startWeight - currentWeight) / (startWeight - goalWeight)) * 100) : 0;

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
                  {currentWeight ? `${currentWeight} ${weightUnit}` : `-- ${weightUnit}`}
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
                  -{monthlyLoss.toFixed(1)} {weightUnit}
                </p>
              </div>
              <i className="fas fa-arrow-down text-green-300"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          
          {/* Screenshot Upload */}
          <button 
            onClick={() => {
              setDialogTab("import");
              setDialogOpen(true);
            }}
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-center" 
            data-testid="button-import-screenshot"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Camera className="w-4 h-4 text-primary" />
            </div>
            <div className="text-xs font-medium text-gray-900">Import</div>
            <div className="text-xs text-gray-500 mt-1">Screenshot</div>
          </button>

          {/* Manual Weight Entry */}
          <button 
            onClick={() => {
              setDialogTab("weight");
              setDialogOpen(true);
            }}
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-center" 
            data-testid="button-log-weight"
          >
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Plus className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-xs font-medium text-gray-900">Log</div>
            <div className="text-xs text-gray-500 mt-1">Weight</div>
          </button>

          {/* Injection Counter */}
          <button 
            onClick={() => {
              setDialogTab("injection");
              setDialogOpen(true);
            }}
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-center relative" 
            data-testid="button-injection-log"
          >
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Syringe className="w-4 h-4 text-accent" />
            </div>
            <div className="text-xs font-medium text-gray-900">Injection</div>
            <div className="text-xs text-gray-500 mt-1">Log</div>
            <div className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium" data-testid="text-injection-count">
              {injectionCount?.count || 0}
            </div>
          </button>

        </div>
      </div>

      {/* Progress Chart */}
      <div className="px-4 py-2">
        <WeightChart 
          weightEntries={weightEntries || []} 
          totalLoss={totalLoss}
          goalProgress={goalProgress}
          goalWeight={goalWeight}
          weightUnit={weightUnit}
        />
      </div>

      {/* Medication Tracker */}
      <div className="px-4 py-2">
        <MedicationTracker userId={demoUser?.id || ""} />
      </div>

      {/* Add Entry Dialog */}
      <AddEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultTab={dialogTab}
      />
    </main>
  );
}
