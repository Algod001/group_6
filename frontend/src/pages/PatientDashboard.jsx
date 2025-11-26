import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Activity, TrendingUp, AlertTriangle, Lightbulb, Trash2, Edit2, Save, X } from 'lucide-react';

export default function PatientDashboard({ session }) {
  const [readings, setReadings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({ avg: 0, last: 0, abnormal: 0 });
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({ value: '', food: '', activity: '', notes: '', date: '' });
  const [editingId, setEditingId] = useState(null); // Track if we are editing

  const user = session.user;

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    // 1. Fetch Readings
    const { data: rData } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .eq('patient_id', user.id)
      .order('timestamp', { ascending: false });

    if (rData) {
      setReadings(rData);
      // Calculate Stats
      const total = rData.reduce((acc, r) => acc + r.value, 0);
      const avg = rData.length ? Math.round(total / rData.length) : 0;
      const last = rData.length ? rData[0].value : 0;
      const abnormal = rData.filter(r => r.category === 'Abnormal').length;
      setStats({ avg, last, abnormal });
    }

    // 2. Fetch Recommendations
    const { data: recData } = await supabase
      .from('recommendations')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });
    
    if (recData) setRecommendations(recData);
  };

  const getCategory = (val) => {
    if (val < 70 || val > 130) return 'Abnormal';
    return 'Normal';
  };

  // --- ACTIONS ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const category = getCategory(Number(form.value));
    const payload = {
      patient_id: user.id,
      value: Number(form.value),
      food_intake: form.food,
      activity: form.activity,
      notes: form.notes,
      category: category,
      timestamp: form.date ? new Date(form.date) : new Date()
    };

    try {
      if (editingId) {
        // UPDATE EXISTING
        await supabase.from('blood_sugar_reading').update(payload).eq('reading_id', editingId);
        alert("Reading Updated!");
      } else {
        // CREATE NEW
        await supabase.from('blood_sugar_reading').insert(payload);
        
        // Trigger AI Analysis only on new readings
        if (category === 'Abnormal') {
            await fetch('http://localhost:5000/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId: user.id })
            });
        }
      }
      
      // Reset Form
      setForm({ value: '', food: '', activity: '', notes: '', date: '' });
      setEditingId(null);
      fetchData();

    } catch (err) {
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reading) => {
    setForm({
        value: reading.value,
        food: reading.food_intake || '',
        activity: reading.activity || '',
        notes: reading.notes || '',
        date: new Date(reading.timestamp).toISOString().slice(0, 16) // Format for input datetime-local
    });
    setEditingId(reading.reading_id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this reading?")) return;
    await supabase.from('blood_sugar_reading').delete().eq('reading_id', id);
    fetchData();
  };

  const cancelEdit = () => {
    setForm({ value: '', food: '', activity: '', notes: '', date: '' });
    setEditingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">My Glucose Monitor</h1>
            <p className="text-gray-500">Welcome back, Patient</p>
        </div>
        {/* Stats Row */}
        <div className="flex gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-500 uppercase">Average</div>
                <div className="text-xl font-bold text-blue-700">{stats.avg}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-500 uppercase">Last</div>
                <div className="text-xl font-bold text-green-700">{stats.last}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-500 uppercase">Abnormal</div>
                <div className="text-xl font-bold text-red-700">{stats.abnormal}</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Input Form */}
        <div className="lg:col-span-1 space-y-6">
            <div className={`p-6 rounded-xl shadow-lg border ${editingId ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    {editingId ? <><Edit2 size={20}/> Edit Reading</> : <><Activity size={20}/> Log New Reading</>}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Blood Sugar (mg/dL)</label>
                        <input type="number" required className="w-full p-2 border rounded bg-white" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Date & Time</label>
                        <input type="datetime-local" className="w-full p-2 border rounded bg-white" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Food Intake</label>
                        <input type="text" placeholder="e.g. Pasta, Cake" className="w-full p-2 border rounded bg-white" value={form.food} onChange={e => setForm({...form, food: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Activity</label>
                        <input type="text" placeholder="e.g. Running" className="w-full p-2 border rounded bg-white" value={form.activity} onChange={e => setForm({...form, activity: e.target.value})} />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex justify-center items-center gap-2">
                            {loading ? "Saving..." : editingId ? <><Save size={16}/> Update</> : "Log Reading"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={cancelEdit} className="px-4 py-2 border rounded hover:bg-gray-100">
                                <X size={18}/>
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Recommendations */}
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
                    <Lightbulb size={18}/> Insights
                </h3>
                <div className="space-y-3">
                    {recommendations.length === 0 && <p className="text-sm text-indigo-400">No insights yet. Keep logging!</p>}
                    {recommendations.map(rec => (
                        <div key={rec.rec_id} className="bg-white p-3 rounded text-sm shadow-sm">
                            <p className="text-gray-800">{rec.advice}</p>
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-xs text-gray-400">{new Date(rec.created_at).toLocaleDateString()}</span>
                                <span className="text-xs font-bold text-indigo-600 uppercase">{rec.source}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Col: History Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-700">History Log</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-500">
                        <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Value</th>
                            <th className="p-3">Context</th>
                            <th className="p-3">Category</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {readings.map(r => (
                            <tr key={r.reading_id} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-gray-500">{new Date(r.timestamp).toLocaleDateString()} {new Date(r.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                <td className="p-3 font-bold">{r.value}</td>
                                <td className="p-3 text-gray-600">
                                    {r.food_intake && <div>🍽️ {r.food_intake}</div>}
                                    {r.activity && <div>🏃 {r.activity}</div>}
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${r.category === 'Abnormal' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {r.category}
                                    </span>
                                </td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => handleEdit(r)} className="text-amber-600 hover:bg-amber-50 p-1 rounded"><Edit2 size={16}/></button>
                                    <button onClick={() => handleDelete(r.reading_id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                        {readings.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400">No readings found. Start by logging one!</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}