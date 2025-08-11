import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";

interface InjectionCounterProps {
  userId: string;
}

export default function InjectionCounter({ userId }: InjectionCounterProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: injectionCount } = useQuery({
    queryKey: ["/api/injection-logs", userId, "count"],
    enabled: !!userId,
  });

  const { data: activeMedication } = useQuery({
    queryKey: ["/api/medications", userId, "active"],
    enabled: !!userId,
  });

  const { data: lastInjection } = useQuery({
    queryKey: ["/api/injection-logs", userId],
    enabled: !!userId,
    select: (data) => data?.[0], // Get the most recent injection
  });

  const recordInjectionMutation = useMutation({
    mutationFn: async () => {
      if (!activeMedication) throw new Error("No active medication found");
      
      return apiRequest("POST", "/api/injection-logs", {
        userId,
        medicationId: activeMedication.id,
        dose: activeMedication.currentDose,
        unit: activeMedication.unit,
        date: new Date().toISOString(),
        injectionSite: "abdomen", // Default site
      });
    },
    onSuccess: () => {
      toast({
        title: "Injection recorded",
        description: "Your dose has been logged successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/injection-logs"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to record injection",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const lastInjectionDate = lastInjection ? new Date(lastInjection.date) : null;
  const daysSinceLastInjection = lastInjectionDate 
    ? Math.floor((Date.now() - lastInjectionDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const formatLastInjection = () => {
    if (!daysSinceLastInjection) return "Never";
    if (daysSinceLastInjection === 0) return "Today";
    if (daysSinceLastInjection === 1) return "Yesterday";
    return `${daysSinceLastInjection} days ago`;
  };

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Injection Tracker</h3>
          <span className="text-sm text-gray-500" data-testid="text-last-injection">
            Last: {formatLastInjection()}
          </span>
        </div>
        
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-accent to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-white" data-testid="text-injection-total">
                {injectionCount?.count || 0}
              </p>
              <p className="text-xs text-orange-100 font-medium">Total Doses</p>
            </div>
          </div>
          
          <Button
            onClick={() => recordInjectionMutation.mutate()}
            disabled={recordInjectionMutation.isPending || !activeMedication}
            className="bg-accent text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-500 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
            data-testid="button-record-injection"
          >
            <Plus className="w-4 h-4 mr-2" />
            {recordInjectionMutation.isPending ? "Recording..." : "Record Injection"}
          </Button>
          
          <p className="text-sm text-gray-500 mt-3">
            {activeMedication 
              ? `Tap to record your ${activeMedication.currentDose}${activeMedication.unit} dose`
              : "Set up your medication first"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
