import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, User, FileText, Send, ClipboardList } from 'lucide-react';

export default function SpecialistDashboard() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [readings, setReadings] = useState([]);
  const [advice, setAdvice] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'patient');
    if (data) setPatients(data);
  };

  const viewDetails = async (patient) => {
    setSelectedPatient(patient);
    const { data } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .eq('patient_id', patient.id)
      .order('timestamp', { ascending: false });
    setReadings(data || []);
    setAdvice(''); // Clear previous input
  };

  const sendFeedback = async () => {
    if (!advice.trim()) return;
    setSending(true);
    try {
        const { error } = await supabase.from('recommendations').insert({
            patient_id: selectedPatient.id,
            advice: advice,
            source: 'Specialist'
        });
        
        if (error) throw error;
        alert("Feedback sent to patient!");
        setAdvice('');
    } catch (err) {
        alert("Error sending feedback");
    } finally {
        setSending(false);
    }
  };

  const filtered = patients.filter(p => 
    (p.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 h-[calc(100vh-80px)] flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Specialist Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left: Patient List */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-col border border-slate-200">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <Search className="text-gray-400" size={20}/>
            <input 
              placeholder="Search patients..." 
              className="outline-none flex-1"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2 overflow-y-auto flex-1">
            {filtered.map(p => (
              <div 
                key={p.id} 
                onClick={() => viewDetails(p)} 
                className={`p-3 cursor-pointer rounded flex items-center gap-3 border transition-colors ${selectedPatient?.id === p.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'hover:bg-gray-50 border-transparent'}`}
              >
                <div className={`p-2 rounded-full ${selectedPatient?.id === p.id ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    <User size={16}/>
                </div>
                <div>
                  <p className="font-medium text-sm">{p.full_name || 'Unnamed'}</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Patient Details */}
        <div className="md:col-span-2 bg-white rounded-lg shadow border border-slate-200 flex flex-col">
          {!selectedPatient ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <ClipboardList size={48} className="mb-4 opacity-20"/>
                <p>Select a patient from the list to view their records.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b bg-slate-50 rounded-t-lg flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedPatient.full_name}</h2>
                    <p className="text-sm text-slate-500">Healthcare ID: {selectedPatient.health_care_number || 'N/A'} • Gender: {selectedPatient.gender || 'N/A'}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{readings.length}</div>
                    <div className="text-xs text-slate-500 uppercase">Total Readings</div>
                </div>
              </div>
              
              {/* Scrollable Readings */}
              <div className="flex-1 overflow-y-auto p-0">
                  {readings.length === 0 ? (
                      <div className="p-10 text-center text-gray-400">No readings recorded for this patient.</div>
                  ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 sticky top-0">
                        <tr>
                            <th className="p-3 border-b">Date</th>
                            <th className="p-3 border-b">Value</th>
                            <th className="p-3 border-b">Category</th>
                            <th className="p-3 border-b">Notes</th>
                        </tr>
                        </thead>
                        <tbody>
                        {readings.map(r => (
                            <tr key={r.reading_id} className="border-b hover:bg-slate-50">
                            <td className="p-3 text-gray-600">{new Date(r.timestamp).toLocaleString()}</td>
                            <td className="p-3 font-bold">{r.value} mg/dL</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                r.category === 'Abnormal' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {r.category}
                                </span>
                            </td>
                            <td className="p-3 text-gray-600">
                                {r.food_intake && <span className="block text-xs">🍽️ {r.food_intake}</span>}
                                {r.activity && <span className="block text-xs">🏃 {r.activity}</span>}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                  )}
              </div>

              {/* Feedback Form */}
              <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Provide Medical Feedback</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder={`Write a recommendation for ${selectedPatient.full_name.split(' ')[0]}...`}
                        className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={advice}
                        onChange={e => setAdvice(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendFeedback()}
                    />
                    <button 
                        onClick={sendFeedback}
                        disabled={sending || !advice}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Send size={16}/> {sending ? 'Sending...' : 'Send'}
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}