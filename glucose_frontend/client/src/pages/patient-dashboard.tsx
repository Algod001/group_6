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

// 1. New Imports to connect Backend
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function PatientDashboard() {
  const { toast } = useToast();
  const { user } = useAuth(); // Get the logged-in user
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for display (You can replace this with a useEffect fetch later)
  const stats = {
    avgSugar: 125,
    lastReading: 118,
    abnormalities: 3,
  };

  const chartData = [
    { date: '11/14', value: 110 },
    { date: '11/15', value: 135 },
    { date: '11/16', value: 122 },
    { date: '11/17', value: 145 },
    { date: '11/18', value: 118 },
    { date: '11/19', value: 128 },
    { date: '11/20', value: 115 },
  ];

  // Helper to auto-categorize for the Database
  const getCategory = (val: number) => {
    if (val < 70 || val > 130) return 'Abnormal';
    if (val >= 70 && val <= 130) return 'Normal';
    return 'Borderline';
  };

  // 2. The REAL Submit Logic
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const sugarValue = Number(formData.get('value'));
    
    try {
      // Step A: Insert into Supabase
      const { error } = await supabase.from('blood_sugar_reading').insert({
        patient_id: user.id, // Use the real User ID
        value: sugarValue,
        food_intake: formData.get('food'),
        activity: formData.get('activity'),
        notes: formData.get('notes'),
        category: getCategory(sugarValue),
        // We use the date from form or current time
        timestamp: formData.get('date') ? new Date(formData.get('date') as string) : new Date()
      });

      if (error) throw error;

      // Step B: Trigger the AI Backend
      try {
        await api.analyze(user.id);
        toast({
          title: 'Reading Logged & Analyzed',
          description: 'AI has checked your reading for patterns.',
        });
      } catch (aiError) {
        console.error("AI Server Error", aiError);
        toast({
            title: 'Reading Saved',
            description: 'Saved to database, but AI server is offline.',
            variant: "destructive"
          });
      }

      (e.target as HTMLFormElement).reset();

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save reading',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock Recommendations (You can fetch real ones from 'recommendations' table later)
  const recommendations = [
    {
      id: 1,
      source: 'AI',
      advice: 'Your blood sugar levels show a pattern of elevation after breakfast. Consider reducing carbohydrate intake in the morning and incorporating more protein.',
      createdAt: '2024-11-19T10:30:00Z',
    },
    {
      id: 2,
      source: 'Specialist',
      advice: 'Great progress this week! Continue with your current meal plan and exercise routine. Let\'s schedule a follow-up next month.',
      createdAt: '2024-11-18T14:20:00Z',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Patient Dashboard</h1>
        <p className="text-muted-foreground">Monitor your blood sugar levels and track your health progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Average Sugar"
          value={stats.avgSugar}
          subtitle="mg/dL"
          icon={Activity}
          trend={{ value: '↓ 5% from last week', isPositive: true }}
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
          subtitle="this week"
          icon={AlertTriangle}
        />
      </div>

      {/* Chart */}
      <BloodSugarChart data={chartData} />

      {/* Two Column Layout: Log Reading & Recommendations */}
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
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    required
                    placeholder="120"
                    data-testid="input-blood-sugar-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date & Time</Label>
                  <Input
                    id="date"
                    name="date"
                    type="datetime-local"
                    required
                    data-testid="input-date-time"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="food">Food Intake</Label>
                <Input
                  id="food"
                  name="food"
                  placeholder="e.g., Oatmeal with berries"
                  data-testid="input-food-intake"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Physical Activity</Label>
                <Input
                  id="activity"
                  name="activity"
                  placeholder="e.g., 30 min walk"
                  data-testid="input-activity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional observations..."
                  rows={3}
                  data-testid="input-notes"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-reading">
                {isSubmitting ? 'Saving...' : 'Log Reading & Trigger AI Analysis'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recommendations List */}
        <Card data-testid="card-recommendations">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-lg border border-border space-y-3 hover-elevate"
                  data-testid={`recommendation-${rec.id}`}
                >
                  <div className="flex items-center gap-2">
                    {rec.source === 'AI' ? (
                      <>
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <Badge variant="secondary" className="text-xs" data-testid={`badge-source-ai-${rec.id}`}>AI Generated</Badge>
                      </>
                    ) : (
                      <>
                        <UserCircle className="h-4 w-4 text-primary" />
                        <Badge variant="default" className="text-xs" data-testid={`badge-source-specialist-${rec.id}`}>Specialist</Badge>
                      </>
                    )}
                  </div>
                  <p className="text-base leading-relaxed" data-testid={`text-advice-${rec.id}`}>{rec.advice}</p>
                  <p className="text-sm text-muted-foreground" data-testid={`text-timestamp-${rec.id}`}>
                    {new Date(rec.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}