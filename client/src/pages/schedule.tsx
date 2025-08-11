import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Syringe, Scale } from "lucide-react";

export default function Schedule() {
  const { data: demoUser } = useQuery({
    queryKey: ["/api/demo-user"],
  });

  const { data: activeMedication } = useQuery({
    queryKey: ["/api/medications", demoUser?.id, "active"],
    enabled: !!demoUser?.id,
  });

  const { data: recentInjections } = useQuery({
    queryKey: ["/api/injection-logs", demoUser?.id],
    enabled: !!demoUser?.id,
    select: (data) => data?.slice(0, 5), // Last 5 injections
  });

  // Generate upcoming schedule
  const generateUpcomingDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + (i * 7)); // Weekly injections
      dates.push(date);
    }
    return dates;
  };

  const upcomingDates = generateUpcomingDates();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  return (
    <main className="max-w-md mx-auto min-h-screen pb-20 pt-4">
      <div className="px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6" data-testid="title-schedule">
          Schedule
        </h1>

        {/* Current Medication */}
        {activeMedication && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Syringe className="w-5 h-5 text-primary" />
                <span>Current Medication</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Medication:</span>
                  <span className="font-medium" data-testid="text-schedule-medication">
                    {activeMedication.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Dose:</span>
                  <span className="font-medium" data-testid="text-schedule-dose">
                    {activeMedication.currentDose}{activeMedication.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Frequency:</span>
                  <Badge variant="secondary">
                    {activeMedication.frequency}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Injections */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Upcoming Injections</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDates.slice(0, 4).map((date, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    index === 0 ? "bg-primary/5 border-primary/20" : "bg-gray-50 border-gray-200"
                  }`}
                  data-testid={`upcoming-injection-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 ? "bg-primary text-white" : "bg-gray-300 text-gray-600"
                    }`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {formatDate(date)}
                        </span>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Next
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {activeMedication?.currentDose}{activeMedication?.unit} injection
                      </p>
                    </div>
                  </div>
                  {isToday(date) && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Today
                    </Badge>
                  )}
                  {isTomorrow(date) && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Tomorrow
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Injections */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Syringe className="w-5 h-5 text-secondary" />
              <span>Recent History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInjections?.map((injection, index) => (
                <div 
                  key={injection.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  data-testid={`recent-injection-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(injection.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric"
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {injection.dose}{injection.unit} - {injection.injectionSite}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Completed
                  </Badge>
                </div>
              ))}
              
              {(!recentInjections || recentInjections.length === 0) && (
                <p className="text-gray-500 text-center py-4">No recent injections</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Weigh-in Reminder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-accent" />
              <span>Weigh-in Reminders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent/5 border border-accent/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Weekly Weigh-in</p>
                    <p className="text-sm text-gray-500">Every Monday morning</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  Enabled
                </Badge>
              </div>
              
              <p className="text-sm text-gray-500 text-center">
                Regular weigh-ins help track your progress accurately
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
