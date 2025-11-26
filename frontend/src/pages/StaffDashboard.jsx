import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Save, Activity, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assignment');
  
  const [thresholds, setThresholds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res1 = await fetch('http://localhost:5001/api/staff/thresholds');
    const data1 = await res1.json();
    if (data1.success) setThresholds(data1.data);

    const res2 = await fetch('http://localhost:5001/api/staff/assignment-data');
    const data2 = await res2.json();
    if (data2.success) {
        setPatients(data2.patients);
        setSpecialists(data2.specialists);
    }
  };

  const handleAssign = async () => {
    if(!selectedPatient || !selectedSpecialist) return alert("Select both users");
    try {
        const res = await fetch('http://localhost:5001/api/staff/assign-patient', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                patientId: selectedPatient,
                specialistId: selectedSpecialist,
                staffId: user.id
            })
        });
        const data = await res.json();
        if(data.success) alert("Patient Assigned Successfully!");
    } catch(e) { alert("Error assigning"); }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-900">Clinic Staff Console</h1>
      
      <div className="flex gap-4 mb-8 border-b">
        <button onClick={() => setActiveTab('assignment')} 
            className={`px-6 py-3 font-medium ${activeTab === 'assignment' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>
            Assign Specialists
        </button>
        <button onClick={() => setActiveTab('thresholds')} 
            className={`px-6 py-3 font-medium ${activeTab === 'thresholds' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>
            Thresholds
        </button>
      </div>

      {activeTab === 'thresholds' && (
        <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Activity className="h-5 w-5 text-purple-600"/> Blood Sugar Thresholds</h2>
            <div className="space-y-4">
                {thresholds.map(t => (
                    <div key={t.category_id} className="flex justify-between items-center p-4 bg-gray-50 rounded border">
                        <span className="font-semibold w-32 text-gray-700">{t.name}</span>
                        <div className="text-sm text-gray-600">Range: {t.min_value} - {t.max_value} mg/dL</div>
                    </div>
                ))}
            </div>
            <p className="text-sm text-gray-500 mt-4 italic">* Threshold updates require API configuration</p>
        </div>
      )}

      {activeTab === 'assignment' && (
        <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><UserPlus className="h-5 w-5 text-green-600"/> Assign Specialist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Patient</label>
                    <select className="w-full border p-3 rounded bg-gray-50" onChange={e => setSelectedPatient(e.target.value)}>
                        <option value="">-- Choose Patient --</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Specialist</label>
                    <select className="w-full border p-3 rounded bg-gray-50" onChange={e => setSelectedSpecialist(e.target.value)}>
                        <option value="">-- Choose Specialist --</option>
                        {specialists.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-8 flex justify-end">
                <button onClick={handleAssign} className="bg-purple-600 text-white px-8 py-2.5 rounded hover:bg-purple-700">Confirm Assignment</button>
            </div>
        </div>
      )}
    </div>
  );
}