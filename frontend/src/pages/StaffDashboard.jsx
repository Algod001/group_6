import { useState, useEffect } from 'react';
import { Save, Activity, Users } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function StaffDashboard() {
  const [thresholds, setThresholds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('config');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Thresholds from Backend
    fetch('http://localhost:5000/api/staff/thresholds')
      .then(res => res.json())
      .then(data => {
         if(data.success && data.data.length > 0) setThresholds(data.data);
         else {
            // Default fallback if DB is empty
            setThresholds([
                { name: 'Normal', min_value: 70, max_value: 130 },
                { name: 'Abnormal', min_value: 0, max_value: 70 },
                { name: 'Borderline', min_value: 130, max_value: 180 }
            ]);
         }
      })
      .catch(err => console.error("API Error:", err));

    // 2. Fetch Patients (Read Only) directly from Supabase
    const fetchPatients = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'patient');
        if(data) setPatients(data);
        setLoading(false);
    };
    fetchPatients();
  }, []);

  const handleUpdate = async (t) => {
    try {
      await fetch('http://localhost:5000/api/staff/thresholds/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: t.name, min: t.min_value, max: t.max_value, staffId: 1 })
      });
      alert("Threshold updated successfully!");
    } catch(err) { alert("Error updating threshold"); }
  };

  if (loading) return <div className="p-10 text-center">Loading Staff Portal...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-900">Clinic Staff Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button 
            onClick={() => setActiveTab('config')}
            className={`pb-2 px-4 ${activeTab === 'config' ? 'border-b-2 border-purple-600 font-bold text-purple-600' : 'text-gray-500'}`}
        >
            System Configuration
        </button>
        <button 
            onClick={() => setActiveTab('patients')}
            className={`pb-2 px-4 ${activeTab === 'patients' ? 'border-b-2 border-purple-600 font-bold text-purple-600' : 'text-gray-500'}`}
        >
            Patient Records
        </button>
      </div>

      {/* Tab 1: Thresholds */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Activity className="text-purple-600"/> Blood Sugar Thresholds</h2>
            <p className="text-sm text-gray-500 mb-4">Configure the AI Engine's detection logic.</p>
            
            <div className="space-y-4">
            {thresholds.map((t, idx) => (
                <div key={idx} className="flex items-center gap-4 border-b pb-4">
                    <div className="w-32 font-bold">{t.name}</div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Min:</span>
                        <input type="number" className="border p-2 rounded w-24" value={t.min_value}
                        onChange={(e) => {
                            const newT = [...thresholds];
                            newT[idx].min_value = Number(e.target.value);
                            setThresholds(newT);
                        }}/>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Max:</span>
                        <input type="number" className="border p-2 rounded w-24" value={t.max_value}
                        onChange={(e) => {
                            const newT = [...thresholds];
                            newT[idx].max_value = Number(e.target.value);
                            setThresholds(newT);
                        }}/>
                    </div>

                    <button onClick={() => handleUpdate(t)} className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 ml-auto">
                        <Save size={18}/> Update
                    </button>
                </div>
            ))}
            </div>
        </div>
      )}

      {/* Tab 2: Patient Records (Read Only) */}
      {activeTab === 'patients' && (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Users className="text-blue-600"/> Administrative Records</h2>
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600">
                    <tr>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Email Contact</th>
                        <th className="p-3">HC Number</th>
                        <th className="p-3">Gender</th>
                        <th className="p-3">Joined</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.length === 0 ? (
                        <tr><td colSpan="5" className="p-4 text-center text-gray-500">No patients found.</td></tr>
                    ) : (
                        patients.map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{p.full_name || 'N/A'}</td>
                                <td className="p-3 text-gray-500">{p.email}</td>
                                <td className="p-3">{p.health_care_number || '-'}</td>
                                <td className="p-3 capitalize">{p.gender || '-'}</td>
                                <td className="p-3">{new Date(p.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
