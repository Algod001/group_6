import { useState, useEffect } from 'react';
import { StatCard } from '@/components/stat-card';
import { BloodSugarChart } from '@/components/blood-sugar-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Activity, TrendingUp, AlertTriangle, Lightbulb, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Connection Imports
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function PatientDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to hold Real Data
  const [readings, setReadings] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [stats, setStats] = useState({ avgSugar: 0, lastReading: 0, abnormalities: 0 });

  // 1. FETCH DATA ON LOAD
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // A. Fetch Readings
      const { data: readingData } = await supabase
        .from('blood_sugar_reading')
        .select('*')
        .eq('patient_id', user.id)
        .order('timestamp', { ascending: true }); // Sort by date for the chart

      if (readingData && readingData.length > 0) {
        setReadings(readingData);

        // Calculate Real Stats
        const total = readingData.reduce((acc, r) => acc + r.value, 0);
        const avg = Math.round(total / readingData.length);
        const last = readingData[readingData.length - 1].value;
        const abnormalCount = readingData.filter(r => r.category === 'Abnormal').length;

        setStats({
          avgSugar: avg,
          lastReading: last,
          abnormalities: abnormalCount
        });
      }

      // B. Fetch AI Recommendations
      const { data: recData } = await supabase
        .from('recommendations')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (recData) setRecommendations(recData);
    };

    fetchData();
  }, [user]);

  // Helper for chart format
  const chartData = readings.map(r => ({
    date: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    value: r.value
  }));

  // Helper to auto-categorize
  const getCategory = (val: number) => {
    if (val < 70 || val > 130) return 'Abnormal';
    if (val >= 70 && val <= 130) return 'Normal';
    return 'Borderline';
  };

  // 2. SUBMIT LOGIC
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const sugarValue = Number(formData.get('value'));
    
    try {
      // Insert into Supabase
      const { error } = await supabase.from('blood_sugar_reading').insert({
        patient_id: user.id,
        value: sugarValue,
        food_intake: formData.get('food'),
        activity: formData.get('activity'),
        notes: formData.get('notes'),
        category: getCategory(sugarValue),
        timestamp: formData.get('date') ? new Date(formData.get('date') as string) : new Date()
      });

      if (error) throw error;

      // Trigger AI
      try {
        await api.analyze(user.id);
        toast({ title: 'Reading Logged', description: 'AI is analyzing your patterns...' });
      } catch (aiError) {
        console.error("AI Server Error");
      }

      // Refresh the page data immediately without reloading
      window.location.reload(); 

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Patient Dashboard</h1>
        <p className="text-muted-foreground">Monitor your blood sugar levels and track your health progress</p>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Average Sugar"
          value={stats.avgSugar}
          subtitle="mg/dL"
          icon={Activity}
          trend={{ value: 'Calculated from history', isPositive: true }}
        />
        <StatCard
          title="Last Reading"
          value={stats.lastReading}
          subtitle="mg/dL"
          icon={TrendingUp}
        />
        <StatCard
          title="Abnormalities"
          value={stats.abnormalities}
          subtitle="total recorded"
          icon={AlertTriangle}
        />
      </div>

      {/* Real Chart */}
      <BloodSugarChart data={chartData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Reading Form */}
        <Card data-testid="card-log-reading">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Log New Reading</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Blood Sugar (mg/dL)</Label>
                  <Input id="value" name="value" type="number" required placeholder="120" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date & Time</Label>
                  <Input id="date" name="date" type="datetime-local" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="food">Food Intake</Label>
                <Input id="food" name="food" placeholder="e.g., Oatmeal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity">Physical Activity</Label>
                <Input id="activity" name="activity" placeholder="e.g., Walking" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Optional..." rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Log Reading & Trigger AI Analysis'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Real Recommendations List */}
        <Card data-testid="card-recommendations">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.length === 0 ? (
                 <p className="text-muted-foreground text-center py-4">No AI recommendations yet. Log 3 abnormal readings to trigger AI.</p>
              ) : (
                recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-lg border border-border space-y-3">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <Badge variant="secondary" className="text-xs">
                           {rec.source || 'AI Generated'}
                        </Badge>
                    </div>
                    <p className="text-base leading-relaxed">{rec.advice}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(rec.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}