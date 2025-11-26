import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, User, FileText } from 'lucide-react';

export default function SpecialistDashboard() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  // 1. Fetch all patients
  const fetchPatients = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'patient');
    if (data) setPatients(data);
  };

  // 2. View Patient Details
  const viewDetails = async (patient) => {
    setSelectedPatient(patient);
    // Fetch their readings
    const { data } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .eq('patient_id', patient.id) // Ensure column matches DB (patient_id or user_id)
      .order('timestamp', { ascending: false });
    setReadings(data || []);
  };

  const filtered = patients.filter(p => 
    (p.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Specialist Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Patient List */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <Search className="text-gray-400" size={20}/>
            <input 
              placeholder="Search patients..." 
              className="outline-none flex-1"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {filtered.map(p => (
              <div key={p.id} onClick={() => viewDetails(p)} className="p-3 hover:bg-blue-50 cursor-pointer rounded flex items-center gap-3 border">
                <div className="bg-blue-100 p-2 rounded-full"><User size={16} className="text-blue-600"/></div>
                <div>
                  <p className="font-medium">{p.full_name || 'Unnamed'}</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Patient Details */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          {!selectedPatient ? (
            <div className="text-center text-gray-400 py-20">Select a patient to view records</div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">{selectedPatient.full_name}'s History</h2>
              
              {readings.length === 0 ? <p>No readings recorded.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Value</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Food/Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readings.map(r => (
                        <tr key={r.reading_id} className="border-b">
                          <td className="p-3">{new Date(r.timestamp).toLocaleString()}</td>
                          <td className="p-3 font-bold">{r.value} mg/dL</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              r.category === 'Abnormal' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {r.category}
                            </span>
                          </td>
                          <td className="p-3">{r.food_intake} {r.notes && `(${r.notes})`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}