import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, AlertTriangle, Lightbulb } from 'lucide-react';
import { useToast } from '@/components/ui/toaster';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function PatientDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [readings, setReadings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Data Helper
  const fetchData = async () => {
    if (!user) return;
    
    // 1. Readings
    const { data: readingData } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .eq('patient_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(10);
    if (readingData) setReadings(readingData);

    // 2. Recommendations
    const { data: recData } = await supabase
      .from('recommendations')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });
    if (recData) setRecommendations(recData);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Determine Category Logic (Frontend Mirror)
  const getCategory = (val) => {
    if (val < 70 || val > 130) return 'Abnormal';
    return 'Normal'; // Simplified for demo
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const sugarValue = Number(formData.get('value'));

    try {
      // 1. Save Reading
      const { error } = await supabase.from('blood_sugar_reading').insert({
        patient_id: user.id,
        value: sugarValue,
        food_intake: formData.get('food'),
        activity: formData.get('activity'),
        category: getCategory(sugarValue)
      });

      if (error) throw error;

      // 2. Call AI Backend
      try {
        const aiRes = await fetch('http://localhost:5001/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId: user.id })
        });
        const aiData = await aiRes.json();
        
        if (aiData.newRecommendations?.length > 0) {
             toast({ title: "New AI Insight!", description: "Check recommendations below." });
        }
      } catch (err) {
        console.error("AI Offline");
      }

      // 3. Refresh UI
      await fetchData();
      (e.target).reset();
      toast({ title: "Success", description: "Reading logged." });

    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-teal-800">Patient Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LOG FORM */}
        <Card>
          <CardHeader><CardTitle>Log Reading</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Blood Sugar (mg/dL)</Label>
                <Input name="value" type="number" required placeholder="120" />
              </div>
              <div>
                <Label>Food Intake</Label>
                <Input name="food" placeholder="e.g. Pasta, Burger" />
              </div>
              <div>
                <Label>Activity</Label>
                <Input name="activity" placeholder="e.g. Running, Resting" />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                {isSubmitting ? "Analyzing..." : "Log Reading"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* RECOMMENDATIONS */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="text-yellow-500"/> AI Insights</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recommendations.length === 0 ? (
                <p className="text-gray-500 text-sm">Log 3 abnormal readings with similar food to trigger AI.</p>
              ) : (
                recommendations.map((rec) => (
                  <div key={rec.rec_id} className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="font-medium text-yellow-800">{rec.source}</p>
                    <p>{rec.advice}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HISTORY TABLE */}
      <Card>
        <CardHeader><CardTitle>Recent History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
             {readings.map(r => (
               <div key={r.reading_id} className="flex justify-between border-b pb-2">
                 <span>{new Date(r.timestamp).toLocaleDateString()}</span>
                 <span className="font-bold">{r.value} mg/dL</span>
                 <span className={r.category === 'Abnormal' ? 'text-red-500' : 'text-green-500'}>{r.category}</span>
               </div>
             ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}