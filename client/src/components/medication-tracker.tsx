import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock } from "lucide-react";

interface MedicationTrackerProps {
  userId: string;
}

export default function MedicationTracker({ userId }: MedicationTrackerProps) {
  const { data: activeMedication } = useQuery({
    queryKey: ["/api/medications", userId, "active"],
    enabled: !!userId,
  });

  if (!activeMedication) {
    return (
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medication Schedule</h3>
          <p className="text-gray-500 text-center py-8">No active medication found</p>
        </CardContent>
      </Card>
    );
  }

  const nextDoseDate = activeMedication.nextDoseDate 
    ? new Date(activeMedication.nextDoseDate)
    : null;

  const formatNextDose = () => {
    if (!nextDoseDate) return "Not scheduled";
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (nextDoseDate.toDateString() === today.toDateString()) return "Today";
    if (nextDoseDate.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    
    return nextDoseDate.toLocaleDateString();
  };

  const titrationSchedule = activeMedication.titrationSchedule as any[] || [];

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Medication Schedule</h3>
          <Badge variant="secondary" className="bg-secondary/10 text-secondary" data-testid="status-medication">
            On Track
          </Badge>
        </div>
        
        {/* Current Medication Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900" data-testid="text-medication-name">
                {activeMedication.name}
              </h4>
              <p className="text-sm text-gray-600">
                Current dose: <span className="font-medium" data-testid="text-current-dose">
                  {activeMedication.currentDose}{activeMedication.unit}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Next injection</p>
              <p className="font-medium text-gray-900" data-testid="text-next-injection">
                {formatNextDose()}
              </p>
            </div>
          </div>
        </div>

        {/* Titration Schedule */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Titration Progress</h4>
          
          {titrationSchedule.map((phase, index) => {
            const isCompleted = phase.status === "completed";
            const isCurrent = phase.status === "current";
            const isUpcoming = phase.status === "upcoming";

            return (
              <div 
                key={index} 
                className="flex items-center space-x-3"
                data-testid={`titration-phase-${index}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? "bg-secondary" : 
                  isCurrent ? "bg-primary animate-pulse-slow" : 
                  "bg-gray-200"
                }`}>
                  {isCompleted && <Check className="w-4 h-4 text-white" />}
                  {isCurrent && <Clock className="w-4 h-4 text-white" />}
                  {isUpcoming && <Clock className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                  }`}>
                    Week {phase.weeks}
                  </p>
                  <p className={`text-sm ${
                    isCompleted ? "text-gray-500" :
                    isCurrent ? "text-primary" :
                    "text-gray-400"
                  }`}>
                    {phase.dose}mg weekly - {
                      isCompleted ? "Completed" :
                      isCurrent ? "Current" :
                      "Upcoming"
                    }
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
