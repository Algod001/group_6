import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, LineChart, Shield, Bell, Users, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import heroImage from '@assets/generated_images/clinical_blood_sugar_monitoring_hero.png';
import { ROLE_DASHBOARDS } from '@shared/constants';

export default function Landing() {
  const [, setLocation] = useLocation();
  const { signIn, signUp } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      
      try {
        // 1. Call the Real Supabase Login
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          throw error; // This triggers the catch block below
        }

        // 2. If successful, the AuthContext (App.tsx) detects the user and redirects automatically
        toast({
          title: "Welcome back",
          description: "Successfully logged in",
        });
        
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Invalid credentials",
        });
      } finally {
        setIsLoading(false);
      }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as string;
    await signUp(
      formData.get('email') as string,
      formData.get('password') as string,
      formData.get('fullName') as string,
      role
    );
    setIsLoading(false);
    setShowSignup(false);
    
    // Redirect based on selected role
    setLocation(ROLE_DASHBOARDS[role] || '/patient/dashboard');
  };

  const features = [
    {
      icon: Activity,
      title: 'Continuous Monitoring',
      description: 'Track your blood sugar levels 24/7 with real-time data collection and instant insights.',
    },
    {
      icon: LineChart,
      title: 'Pattern Detection',
      description: 'AI-powered analysis identifies trends and patterns in your glucose data automatically.',
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Receive intelligent notifications when readings fall outside your target range.',
    },
    {
      icon: Users,
      title: 'Specialist Care',
      description: 'Connect with healthcare specialists who monitor your progress and provide guidance.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is protected with enterprise-grade security and encryption.',
    },
    {
      icon: TrendingUp,
      title: 'Personalized Insights',
      description: 'Get customized recommendations based on your unique health profile and habits.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Medical monitoring technology"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
        </div>

        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary p-2">
                  <Activity className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-semibold text-lg text-white">Blood Sugar Monitor</span>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowLogin(true)}
                  className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
                  data-testid="button-login"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => setShowSignup(true)}
                  className="backdrop-blur-md bg-primary/90 hover:bg-primary"
                  data-testid="button-signup"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Continuous Glucose Monitoring<br />
              Made Simple
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Professional blood sugar monitoring system with AI-powered pattern detection, 
              personalized recommendations, and seamless care coordination between patients and specialists.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={() => setShowSignup(true)}
                className="backdrop-blur-md bg-primary hover:bg-primary/90"
                data-testid="button-get-started-hero"
              >
                Start Monitoring
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-12 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">
              Complete Blood Sugar Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to monitor, understand, and manage your glucose levels effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
                <CardContent className="p-8">
                  <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-12 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of patients and healthcare providers using our platform.
          </p>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => setShowSignup(true)}
            className="bg-white text-primary hover:bg-white/90 border-0"
            data-testid="button-signup-cta"
          >
            Get Started Today
          </Button>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent data-testid="dialog-login">
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your dashboard
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input 
                id="login-email" 
                name="email" 
                type="email" 
                required 
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input 
                id="login-password" 
                name="password" 
                type="password" 
                required 
                data-testid="input-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-login">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Signup Dialog */}
      <Dialog open={showSignup} onOpenChange={setShowSignup}>
        <DialogContent data-testid="dialog-signup">
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>
              Sign up to start monitoring your blood sugar levels
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <Input 
                id="signup-name" 
                name="fullName" 
                required 
                data-testid="input-fullname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input 
                id="signup-email" 
                name="email" 
                type="email" 
                required 
                data-testid="input-signup-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input 
                id="signup-password" 
                name="password" 
                type="password" 
                required 
                data-testid="input-signup-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-role">Role</Label>
              <Select name="role" defaultValue="patient" required>
                <SelectTrigger data-testid="select-role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-signup">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
