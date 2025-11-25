import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // This import will now work
import { LogOut, Activity } from 'lucide-react';

export default function PatientDashboard({ session }) {
  const [readings, setReadings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [form, setForm] = useState({ value: '', food: '', activity: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: rData } = await supabase.from('blood_sugar_reading').select('*').eq('patient_id', session.user.id).order('measured_at', { ascending: false });
    if (rData) setReadings(rData);

    const { data: recData } = await supabase.from('recommendations').select('*').eq('patient_id', session.user.id);
    if (recData) setRecommendations(recData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(form.value);
    let category = 'Normal';
    if (val < 70 || val > 130) category = 'Abnormal';
    else if ((val >= 70 && val < 80) || (val > 120 && val <= 130)) category = 'Borderline';

    await supabase.from('blood_sugar_reading').insert({
      patient_id: session.user.id,
      value: val,
      food_intake: form.food,
      activity: form.activity,
      category: category
    });

    try {
        await fetch('http://localhost:5001/api/ai/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId: session.user.id })
        });
    } catch (err) { console.error("AI Backend offline"); }

    setForm({ value: '', food: '', activity: '' });
    fetchData(); 
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">My Glucose Monitor</h1>
        <button onClick={() => supabase.auth.signOut()} className="flex items-center text-gray-600 hover:text-red-500">
          <LogOut className="w-4 h-4 mr-2"/> Sign Out
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center"><Activity className="w-5 h-5 mr-2"/> Log New Reading</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="number" placeholder="Value (mg/dL)" required className="w-full border p-2 rounded" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
            <input type="text" placeholder="Food Intake" className="w-full border p-2 rounded" value={form.food} onChange={e => setForm({...form, food: e.target.value})} />
            <input type="text" placeholder="Activity" className="w-full border p-2 rounded" value={form.activity} onChange={e => setForm({...form, activity: e.target.value})} />
            <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Log Reading</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-purple-600">AI Insights</h2>
          {recommendations.length === 0 ? <p className="text-gray-400">Log 3 abnormal readings to generate insights.</p> : (
            <ul className="space-y-3">
                {recommendations.map(rec => <li key={rec.rec_id} className="bg-purple-50 p-3 rounded border border-purple-100 text-sm">{rec.advice}</li>)}
            </ul>
          )}
        </div>
        
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">History</h3>
            <table className="w-full text-left">
                <thead><tr className="border-b text-gray-500 text-sm"><th className="p-2">Date</th><th className="p-2">Value</th><th className="p-2">Category</th><th className="p-2">Context</th></tr></thead>
                <tbody>
                    {readings.map(r => (
                        <tr key={r.reading_id} className="border-b last:border-0">
                            <td className="p-2 text-sm">{new Date(r.measured_at).toLocaleDateString()}</td>
                            <td className="p-2 font-bold">{r.value}</td>
                            <td className="p-2"><span className={`px-2 py-1 rounded text-xs ${r.category === 'Abnormal' ? 'bg-red-100 text-red-800' : 'bg-green-100'}`}>{r.category}</span></td>
                            <td className="p-2 text-sm text-gray-500">{r.food_intake} {r.activity && `+ ${r.activity}`}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}