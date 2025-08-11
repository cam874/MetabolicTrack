import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Lock, HelpCircle, FileText, LogOut } from "lucide-react";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    injectionReminders: true,
    weighInReminders: true,
    progressUpdates: false,
    motivationalMessages: true,
  });

  const [profile, setProfile] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@example.com",
    goalWeight: "150",
    startDate: "2024-01-01",
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileChange = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  return (
    <main className="max-w-md mx-auto min-h-screen pb-20 pt-4">
      <div className="px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6" data-testid="title-settings">
          Settings
        </h1>

        {/* Profile Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => handleProfileChange("firstName", e.target.value)}
                  data-testid="input-first-name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => handleProfileChange("lastName", e.target.value)}
                  data-testid="input-last-name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange("email", e.target.value)}
                data-testid="input-email"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goalWeight">Goal Weight (lbs)</Label>
                <Input
                  id="goalWeight"
                  value={profile.goalWeight}
                  onChange={(e) => handleProfileChange("goalWeight", e.target.value)}
                  data-testid="input-goal-weight"
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={profile.startDate}
                  onChange={(e) => handleProfileChange("startDate", e.target.value)}
                  data-testid="input-start-date"
                />
              </div>
            </div>
            
            <Button className="w-full" data-testid="button-save-profile">
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-primary" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Injection Reminders</Label>
                <p className="text-sm text-gray-500">Get reminded about upcoming doses</p>
              </div>
              <Switch
                checked={notifications.injectionReminders}
                onCheckedChange={(checked) => handleNotificationChange("injectionReminders", checked)}
                data-testid="switch-injection-reminders"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Weigh-in Reminders</Label>
                <p className="text-sm text-gray-500">Weekly weight tracking reminders</p>
              </div>
              <Switch
                checked={notifications.weighInReminders}
                onCheckedChange={(checked) => handleNotificationChange("weighInReminders", checked)}
                data-testid="switch-weighin-reminders"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Progress Updates</Label>
                <p className="text-sm text-gray-500">Monthly progress summaries</p>
              </div>
              <Switch
                checked={notifications.progressUpdates}
                onCheckedChange={(checked) => handleNotificationChange("progressUpdates", checked)}
                data-testid="switch-progress-updates"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Motivational Messages</Label>
                <p className="text-sm text-gray-500">Encouraging tips and insights</p>
              </div>
              <Switch
                checked={notifications.motivationalMessages}
                onCheckedChange={(checked) => handleNotificationChange("motivationalMessages", checked)}
                data-testid="switch-motivational-messages"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-primary" />
              <span>Security & Privacy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-change-password"
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-export-data"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700"
              data-testid="button-delete-account"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span>Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-help-center"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help Center
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-contact-support"
            >
              <FileText className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">MedTrack Pro v1.0.0</p>
              <p className="text-xs text-gray-400 mt-1">
                Made for GLP-1 medication users
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
