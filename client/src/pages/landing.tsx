import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Target, Calendar, TrendingDown } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            MedTrack Pro
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Your comprehensive companion for GLP-1 medication weight loss tracking. 
            Monitor progress, manage medications, and achieve your goals.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            Get Started - Sign In
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <TrendingDown className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Weight Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track your weight loss journey with detailed progress charts and goal predictions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle>Medication Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor GLP-1 medications like Ozempic, Wegovy, and Mounjaro with titration schedules.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Injection Logging</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Log injections with site rotation tracking and dose progression monitoring.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Goal Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-powered goal completion predictions based on your weight loss trends.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to transform your health journey?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of users successfully managing their GLP-1 medication therapy.
          </p>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login-secondary"
          >
            Sign In with Replit
          </Button>
        </div>
      </div>
    </div>
  );
}