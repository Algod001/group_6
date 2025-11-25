import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"; // Import Toast
import { supabase } from "@/lib/supabase";     // Import Supabase
import { Activity, ShieldCheck, Users, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Landing() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast(); // Define toast here
  const [isLoading, setIsLoading] = useState(false);
  
  // Define formData state here
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "patient",
  });

  const [isLogin, setIsLogin] = useState(true);

  // Handle typing in inputs
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({ title: "Welcome back", description: "Successfully logged in" });
      // App.tsx handles redirection automatically via AuthContext
      
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.fullName, role: formData.role },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
      setIsLogin(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">Blood Sugar Monitor</span>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>Login / Get Started</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{isLogin ? "Sign In" : "Create Account"}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4 mt-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                </div>

                {!isLogin && (
                  <input type="hidden" value="patient" />// only patient can create and log in

                  // <div className="space-y-2">
                  //   <Label>Role</Label>
                  //   <Select 
                  //     defaultValue="patient" 
                  //     onValueChange={(val) => handleInputChange("role", val)}
                  //   >
                  //     <SelectTrigger>
                  //       <SelectValue />
                  //     </SelectTrigger>
                  //     <SelectContent>
                  //       <SelectItem value="patient">Patient</SelectItem>
                  //       <SelectItem value="specialist">Specialist</SelectItem>
                  //     </SelectContent>
                  //   </Select>
                  // </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    {isLogin ? "New to the platform? " : "Already have an account? "}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:underline font-medium"
                  >
                    {isLogin ? "Sign up" : "Login"}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 bg-gradient-to-b from-blue-50/50">
        <div className="container px-4 text-center space-y-8 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
            Continuous Glucose Monitoring <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Professional blood sugar monitoring system with AI-powered pattern detection, 
            personalized recommendations, and seamless care coordination between patients and specialists.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="h-12 px-8 text-lg">Start Monitoring</Button>
              </DialogTrigger>
              <DialogContent>
                 <DialogHeader><DialogTitle>Sign In Required</DialogTitle></DialogHeader>
                 <p>Please use the Login button at the top right.</p>
              </DialogContent>
            </Dialog>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">Learn More</Button>
          </div>
        </div>
      </section>
    </div>
  );
}