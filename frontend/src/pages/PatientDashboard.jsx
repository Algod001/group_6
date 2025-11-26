import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, History, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [readings, setReadings] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [value, setValue] = useState('');
    const [food, setFood] = useState('');
    const [activity, setActivity] = useState('');

    useEffect(() => {
        if(user) {
            fetchHistory();
            fetchRecommendations();
        }
    }, [user]);

    const fetchHistory = async () => {
        const { data } = await supabase
            .from('blood_sugar_reading')
            .select('*')
            .eq('patient_id', user.id)
            .order('timestamp', { ascending: false });
        setReadings(data || []);
    };

    const fetchRecommendations = async () => {
        const { data } = await supabase
            .from('recommendations')
            .select('*')
            .eq('patient_id', user.id);
        setRecommendations(data || []);
    };

    const getCategory = (val) => {
        const num = parseFloat(val);
        if(num < 70 || num > 130) return 'Abnormal';
        if(num >= 70 && num <= 130) return 'Normal';
        return 'Borderline';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const category = getCategory(value);

        try {
            // 1. Save to DB
            const { error } = await supabase.from('blood_sugar_reading').insert({
                patient_id: user.id,
                value: parseFloat(value),
                food_intake: food,
                activity: activity,
                category: category
            });

            if (error) throw error;

            // 2. Trigger AI Analysis
            await fetch('http://localhost:5001/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId: user.id })
            });

            alert("Reading logged and analyzed!");
            setValue(''); setFood(''); setActivity('');
            fetchHistory(); 
            fetchRecommendations();

        } catch (err) {
            alert("Error logging reading: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-blue-900">Patient Dashboard</h1>
                <button onClick={() => navigate('/profile')} className="text-blue-600 hover:underline">My Profile</button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Form */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <PlusCircle className="text-blue-500"/> Log New Reading
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600">Blood Sugar (mg/dL)</label>
                            <input type="number" required className="w-full border p-2 rounded" 
                                value={value} onChange={e => setValue(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Food Intake</label>
                            <input type="text" className="w-full border p-2 rounded" placeholder="e.g. Pasta"
                                value={food} onChange={e => setFood(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Activity</label>
                            <input type="text" className="w-full border p-2 rounded" placeholder="e.g. Walking"
                                value={activity} onChange={e => setActivity(e.target.value)} />
                        </div>
                        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                            {loading ? 'Analyzing...' : 'Submit Reading'}
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500 lg:col-span-2">
                     <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <History className="text-purple-500"/> Recent History
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Value</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Food</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {readings.map(r => (
                                    <tr key={r.reading_id}>
                                        <td className="px-4 py-3 text-sm">{new Date(r.timestamp).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm font-bold">{r.value}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                r.category === 'Normal' ? 'bg-green-100 text-green-800' : 
                                                r.category === 'Abnormal' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {r.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{r.food_intake || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="lg:col-span-3 bg-blue-50 p-6 rounded-lg border border-blue-100">
                     <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-900">
                        <Lightbulb className="text-yellow-500"/> AI Insights & Recommendations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.length === 0 ? <p className="text-gray-500">No recommendations yet.</p> : 
                         recommendations.map(rec => (
                            <div key={rec.rec_id} className="bg-white p-4 rounded border border-blue-100">
                                <p className="text-gray-800">{rec.advice}</p>
                                <span className="text-xs text-gray-400 mt-2 block">Source: {rec.source}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}