import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Weight, Syringe, Camera } from "lucide-react";
import UploadArea from "@/components/upload-area";

interface AddEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

export default function AddEntryDialog({ open, onOpenChange, defaultTab = "weight" }: AddEntryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: demoUser } = useQuery({
    queryKey: ["/api/demo-user"],
  });

  const { data: activeMedication } = useQuery({
    queryKey: ["/api/medications", demoUser?.id, "active"],
    enabled: !!demoUser?.id,
  });

  const [weightData, setWeightData] = useState({
    weight: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
  });

  const [injectionData, setInjectionData] = useState({
    dose: activeMedication?.currentDose || "",
    injectionSite: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
  });

  const addWeightMutation = useMutation({
    mutationFn: async (data: typeof weightData) => {
      const response = await apiRequest("POST", "/api/weight-entries", {
        userId: demoUser?.id,
        weight: data.weight,
        unit: demoUser?.weightUnit || "lbs",
        date: new Date(data.date),
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Weight logged successfully",
        description: "Your weight entry has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weight-entries"] });
      setWeightData({ weight: "", notes: "", date: new Date().toISOString().split('T')[0] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to log weight",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const addInjectionMutation = useMutation({
    mutationFn: async (data: typeof injectionData) => {
      if (!activeMedication) throw new Error("No active medication found");
      
      const response = await apiRequest("POST", "/api/injection-logs", {
        userId: demoUser?.id,
        medicationId: activeMedication.id,
        dose: data.dose,
        unit: "mg",
        injectionSite: data.injectionSite,
        date: new Date(data.date),
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Injection logged successfully",
        description: "Your injection has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/injection-logs"] });
      setInjectionData({
        dose: activeMedication?.currentDose || "",
        injectionSite: "",
        notes: "",
        date: new Date().toISOString().split('T')[0],
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to log injection",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const injectionSites = [
    "Stomach/Abdomen",
    "Upper arm",
    "Thigh (front)",
    "Thigh (side)",
    "Other",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Entry</DialogTitle>
          <DialogDescription>
            Log your weight, injection, or import data from a screenshot.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weight" className="flex items-center gap-2">
              <Weight className="w-4 h-4" />
              <span className="hidden sm:inline">Weight</span>
            </TabsTrigger>
            <TabsTrigger value="injection" className="flex items-center gap-2">
              <Syringe className="w-4 h-4" />
              <span className="hidden sm:inline">Injection</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weight" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight</Label>
                <div className="relative">
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="150.5"
                    value={weightData.weight}
                    onChange={(e) => setWeightData(prev => ({ ...prev, weight: e.target.value }))}
                    data-testid="input-add-weight"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {demoUser?.weightUnit || "lbs"}
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="weight-date">Date</Label>
                <Input
                  id="weight-date"
                  type="date"
                  value={weightData.date}
                  onChange={(e) => setWeightData(prev => ({ ...prev, date: e.target.value }))}
                  data-testid="input-add-weight-date"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="weight-notes">Notes (optional)</Label>
              <Textarea
                id="weight-notes"
                placeholder="Feeling good, had a light breakfast..."
                value={weightData.notes}
                onChange={(e) => setWeightData(prev => ({ ...prev, notes: e.target.value }))}
                data-testid="textarea-add-weight-notes"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={() => addWeightMutation.mutate(weightData)}
                disabled={!weightData.weight || addWeightMutation.isPending}
                data-testid="button-save-weight"
              >
                {addWeightMutation.isPending ? "Saving..." : "Save Weight"}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="injection" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dose">Dose</Label>
                <div className="relative">
                  <Input
                    id="dose"
                    type="number"
                    step="0.25"
                    placeholder="1.0"
                    value={injectionData.dose}
                    onChange={(e) => setInjectionData(prev => ({ ...prev, dose: e.target.value }))}
                    data-testid="input-add-injection-dose"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    mg
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="injection-date">Date</Label>
                <Input
                  id="injection-date"
                  type="date"
                  value={injectionData.date}
                  onChange={(e) => setInjectionData(prev => ({ ...prev, date: e.target.value }))}
                  data-testid="input-add-injection-date"
                />
              </div>
            </div>
            <div>
              <Label>Injection Site</Label>
              <Select
                value={injectionData.injectionSite}
                onValueChange={(value) => setInjectionData(prev => ({ ...prev, injectionSite: value }))}
              >
                <SelectTrigger data-testid="select-injection-site">
                  <SelectValue placeholder="Select injection site" />
                </SelectTrigger>
                <SelectContent>
                  {injectionSites.map((site) => (
                    <SelectItem key={site} value={site}>
                      {site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="injection-notes">Notes (optional)</Label>
              <Textarea
                id="injection-notes"
                placeholder="No side effects, feeling good..."
                value={injectionData.notes}
                onChange={(e) => setInjectionData(prev => ({ ...prev, notes: e.target.value }))}
                data-testid="textarea-add-injection-notes"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={() => addInjectionMutation.mutate(injectionData)}
                disabled={!injectionData.dose || addInjectionMutation.isPending}
                data-testid="button-save-injection"
              >
                {addInjectionMutation.isPending ? "Saving..." : "Save Injection"}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Import from Screenshot</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload a screenshot from another weight tracking app to import your data.
              </p>
              <UploadArea userId={demoUser?.id || ""} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}