import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Removed Textarea import to avoid creating new file
import { Activity, Lightbulb, Pencil, Trash2, Utensils, Dumbbell } from 'lucide-react';
import { useToast } from '@/components/ui/toaster';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function PatientDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Data State
  const [readings, setReadings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Mode State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    value: "",
    food: "",
    activity: "",
    notes: ""
  });

  // 1. Fetch Data Helper
  const fetchData = async () => {
    if (!user) return;
    
    // A. Readings
    const { data: readingData } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .eq('patient_id', user.id)
      .order('timestamp', { ascending: false });
    if (readingData) setReadings(readingData);

    // B. Recommendations (AI)
    // First, trigger backend to ensure we have the latest analysis
    try {
        await fetch('http://localhost:5001/api/ai/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId: user.id })
        });
    } catch (err) { console.error("AI Trigger Failed"); }

    // Then fetch from DB
    const { data: recData } = await supabase
      .from('recommendations')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3); // Get top 3 most recent
    
    if (recData && recData.length > 0) {
        setRecommendations(recData);
    } else {
        // Fallback if DB is completely empty
        setRecommendations([{ id: 'default', advice: "Welcome! Log your first reading to start receiving AI insights.", source: "System" }]);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [user]);

  // Determine Category
  const getCategory = (val) => {
    if (val < 70 || val > 130) return 'Abnormal';
    return 'Normal'; 
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const sugarValue = Number(formData.value);

    try {
        const payload = {
            patient_id: user.id,
            value: sugarValue,
            food_intake: formData.food,
            activity: formData.activity,
            notes: formData.notes,
            category: getCategory(sugarValue)
        };

        if (editingId) {
            // UPDATE Existing
            const { error } = await supabase
                .from('blood_sugar_reading')
                .update(payload)
                .eq('reading_id', editingId); // Using reading_id as PK
            if (error) throw error;
            toast({ title: "Updated", description: "Reading updated successfully." });
        } else {
            // INSERT New
            const { error } = await supabase
                .from('blood_sugar_reading')
                .insert(payload);
            if (error) throw error;
            toast({ title: "Logged", description: "Reading saved successfully." });
        }

        // Reset
        setFormData({ value: "", food: "", activity: "", notes: "" });
        setEditingId(null);
        
        // Refresh UI
        await fetchData();

    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Button Click
  const handleEdit = (item) => {
    setEditingId(item.reading_id); 
    setFormData({
        value: item.value,
        food: item.food_intake || "",
        activity: item.activity || "",
        notes: item.notes || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Delete Button Click
  const handleDelete = async (id) => {
    if(!confirm("Delete this reading?")) return;
    const { error } = await supabase.from('blood_sugar_reading').delete().eq('reading_id', id);
    if(error) toast({ variant: "destructive", title: "Error", description: error.message });
    else {
        toast({ title: "Deleted", description: "Reading removed." });
        fetchData();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-teal-800">Patient Dashboard</h1>
        <div className="text-sm text-gray-500">Welcome, {user?.full_name || 'User'}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT COLUMN: LOG FORM */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                {editingId ? <Pencil className="h-4 w-4"/> : <Activity className="h-4 w-4"/>}
                {editingId ? "Edit Reading" : "Log Reading"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Blood Sugar (mg/dL)</Label>
                <Input 
                    name="value" 
                    type="number" 
                    required 
                    value={formData.value} 
                    onChange={handleInputChange}
                    placeholder="120" 
                />
              </div>
              <div>
                <Label>Food Intake</Label>
                <Input 
                    name="food" 
                    value={formData.food} 
                    onChange={handleInputChange}
                    placeholder="e.g. Pasta, Burger" 
                />
              </div>
              <div>
                <Label>Activity</Label>
                <Input 
                    name="activity" 
                    value={formData.activity} 
                    onChange={handleInputChange}
                    placeholder="e.g. Running, Resting" 
                />
              </div>
              <div>
                <Label>Notes</Label>
                {/* Standard HTML Textarea instead of custom component */}
                <textarea 
                    name="notes"
                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Optional notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
                    {isSubmitting ? "Saving..." : (editingId ? "Update" : "Log Reading")}
                </Button>
                {editingId && (
                    <Button type="button" variant="outline" onClick={() => {
                        setEditingId(null);
                        setFormData({ value: "", food: "", activity: "", notes: "" });
                    }}>
                        Cancel
                    </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: AI & HISTORY */}
        <div className="md:col-span-2 space-y-6">
            
            {/* RECOMMENDATIONS */}
            <Card className="bg-yellow-50/50 border-yellow-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <Lightbulb className="h-5 w-5"/> AI Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-white border border-yellow-100 rounded-lg shadow-sm text-sm">
                        <p className="text-gray-800 leading-relaxed">{rec.advice}</p>
                        <span className="text-xs text-gray-400 mt-1 block">
                            {new Date(rec.created_at || Date.now()).toLocaleDateString()}
                        </span>
                    </div>
                ))}
                {recommendations.length === 0 && (
                    <p className="text-gray-500 italic">Loading AI analysis...</p>
                )}
                </div>
            </CardContent>
            </Card>

            {/* HISTORY TABLE */}
            <Card>
            <CardHeader><CardTitle>Recent History</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {readings.length === 0 && <p className="text-center text-gray-500">No readings yet.</p>}
                    
                    {readings.map(r => (
                    <div key={r.reading_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                        {/* Data Column */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-lg">{r.value} <span className="text-xs font-normal text-gray-500">mg/dL</span></span>
                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                    r.category === 'Abnormal' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {r.category}
                                </span>
                            </div>
                            <div className="flex gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Utensils className="h-3 w-3"/> {r.food_intake || '-'}</span>
                                <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3"/> {r.activity || '-'}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                                {new Date(r.timestamp).toLocaleString()}
                            </div>
                        </div>

                        {/* Actions Column */}
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(r)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(r.reading_id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    ))}
                </div>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}