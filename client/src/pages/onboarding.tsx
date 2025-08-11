import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Camera, Weight, Target, Pill, User, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import UploadArea from "@/components/upload-area";

interface OnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  startWeight: string;
  goalWeight: string;
  weightUnit: string;
  medicationName: string;
  medicationType: string;
  currentDose: string;
  startDate: string;
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [data, setData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    email: "",
    startWeight: "",
    goalWeight: "",
    weightUnit: "lbs",
    medicationName: "",
    medicationType: "semaglutide",
    currentDose: "",
    startDate: new Date().toISOString().split('T')[0],
  });

  const updateData = (key: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const completeMutation = useMutation({
    mutationFn: async (onboardingData: OnboardingData) => {
      // Get current user
      const user = await apiRequest("GET", "/api/demo-user");
      const userId = user.id;

      // Update user profile
      await apiRequest("PATCH", "/api/users/demo", {
        firstName: onboardingData.firstName,
        lastName: onboardingData.lastName,
        email: onboardingData.email,
        startWeight: onboardingData.startWeight,
        goalWeight: onboardingData.goalWeight,
        weightUnit: onboardingData.weightUnit,
        hasCompletedOnboarding: "true"
      });

      // Create initial weight entry
      await apiRequest("POST", "/api/weight-entries", {
        userId: userId,
        weight: onboardingData.startWeight,
        unit: onboardingData.weightUnit,
        date: new Date(onboardingData.startDate).toISOString(),
        notes: "Starting weight"
      });

      // Create medication
      await apiRequest("POST", "/api/medications", {
        userId: userId,
        name: onboardingData.medicationName,
        type: onboardingData.medicationType,
        currentDose: onboardingData.currentDose,
        targetDose: "2.0", // Default target
        unit: "mg",
        frequency: "weekly",
        startDate: new Date(onboardingData.startDate).toISOString(),
        nextDoseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
        isActive: "true"
      });

      return true;
    },
    onSuccess: () => {
      toast({
        title: "Welcome to MedTrack Pro!",
        description: "Your profile has been set up successfully.",
      });
      queryClient.invalidateQueries();
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Setup failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeMutation.mutate(data);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.firstName && data.lastName && data.email;
      case 2:
        return data.startWeight && data.goalWeight;
      case 3:
        return data.medicationName && data.currentDose;
      default:
        return true;
    }
  };

  const medications = [
    { value: "semaglutide", label: "Ozempic/Wegovy (Semaglutide)" },
    { value: "tirzepatide", label: "Mounjaro/Zepbound (Tirzepatide)" },
    { value: "liraglutide", label: "Saxenda (Liraglutide)" },
    { value: "dulaglutide", label: "Trulicity (Dulaglutide)" },
  ];

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-primary to-purple-600">
      <div className="px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chart-line text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to MedTrack Pro</h1>
          <p className="text-indigo-100">Let's set up your weight loss journey</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? "bg-white text-primary" 
                  : "bg-white/20 text-white/60"
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-8 h-1 mx-2 ${
                  step < currentStep ? "bg-white" : "bg-white/20"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <User className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-gray-500">Tell us a bit about yourself</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={data.firstName}
                      onChange={(e) => updateData("firstName", e.target.value)}
                      placeholder="Sarah"
                      data-testid="input-onboarding-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={data.lastName}
                      onChange={(e) => updateData("lastName", e.target.value)}
                      placeholder="Johnson"
                      data-testid="input-onboarding-last-name"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => updateData("email", e.target.value)}
                    placeholder="sarah@example.com"
                    data-testid="input-onboarding-email"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Weight Goals */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Weight className="w-6 h-6 text-primary" />
                    <Target className="w-6 h-6 text-secondary" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Weight Goals</h2>
                  <p className="text-gray-500">Set your starting point and target</p>
                </div>

                <div>
                  <Label>Preferred Unit</Label>
                  <Select value={data.weightUnit} onValueChange={(value) => updateData("weightUnit", value)}>
                    <SelectTrigger data-testid="select-weight-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startWeight">Starting Weight</Label>
                    <div className="relative">
                      <Input
                        id="startWeight"
                        type="number"
                        value={data.startWeight}
                        onChange={(e) => updateData("startWeight", e.target.value)}
                        placeholder="185"
                        data-testid="input-start-weight"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        {data.weightUnit}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="goalWeight">Goal Weight</Label>
                    <div className="relative">
                      <Input
                        id="goalWeight"
                        type="number"
                        value={data.goalWeight}
                        onChange={(e) => updateData("goalWeight", e.target.value)}
                        placeholder="150"
                        data-testid="input-goal-weight"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        {data.weightUnit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    Or import your data from another app
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowUpload(!showUpload)}
                    data-testid="button-show-upload"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Screenshot
                  </Button>
                </div>

                {showUpload && (
                  <div className="mt-4">
                    <UploadArea userId="demo" />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Medication */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Pill className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Your Medication</h2>
                  <p className="text-gray-500">Tell us about your current GLP-1 medication</p>
                </div>

                <div>
                  <Label>Medication Type</Label>
                  <Select value={data.medicationType} onValueChange={(value) => updateData("medicationType", value)}>
                    <SelectTrigger data-testid="select-medication-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {medications.map((med) => (
                        <SelectItem key={med.value} value={med.value}>
                          {med.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="medicationName">Medication Name</Label>
                  <Input
                    id="medicationName"
                    value={data.medicationName}
                    onChange={(e) => updateData("medicationName", e.target.value)}
                    placeholder="Ozempic (Semaglutide)"
                    data-testid="input-medication-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentDose">Current Dose</Label>
                    <div className="relative">
                      <Input
                        id="currentDose"
                        type="number"
                        step="0.25"
                        value={data.currentDose}
                        onChange={(e) => updateData("currentDose", e.target.value)}
                        placeholder="1.0"
                        data-testid="input-current-dose"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        mg
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={data.startDate}
                      onChange={(e) => updateData("startDate", e.target.value)}
                      data-testid="input-start-date"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-check text-green-600 text-xl"></i>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">All Set!</h2>
                  <p className="text-gray-500">Review your information</p>
                </div>

                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{data.firstName} {data.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Weight:</span>
                    <span className="font-medium">{data.startWeight} {data.weightUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Goal Weight:</span>
                    <span className="font-medium">{data.goalWeight} {data.weightUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medication:</span>
                    <span className="font-medium">{data.medicationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Dose:</span>
                    <span className="font-medium">{data.currentDose}mg</span>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            data-testid="button-back"
          >
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed() || completeMutation.isPending}
            className="bg-white text-primary hover:bg-gray-100"
            data-testid="button-next"
          >
            {currentStep === 4 ? (
              completeMutation.isPending ? "Setting up..." : "Complete Setup"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}