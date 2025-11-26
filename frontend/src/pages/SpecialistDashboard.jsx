import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext'; 
import { AlertTriangle, Users, Eye } from 'lucide-react';

export default function SpecialistDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if(user) {
        fetchAssignedPatients();
        fetchAlerts();
    }
  }, [user]);

  const fetchAssignedPatients = async () => {
    const { data: assignments } = await supabase
        .from('patient_specialist_assignment')
        .select('patient_id')
        .eq('specialist_id', user.id);
    
    if(assignments && assignments.length > 0) {
        const patientIds = assignments.map(a => a.patient_id);
        const { data } = await supabase.from('profiles').select('*').in('id', patientIds);
        setPatients(data || []);
    }
  };

  const fetchAlerts = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*, profiles:patient_id(full_name)')
        .eq('specialist_id', user.id)
        .eq('status', 'Pending');
      setAlerts(data || []);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Specialist Portal</h1>

      {alerts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r shadow-sm">
              <p className="font-bold text-red-700 flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> Critical Alerts</p>
              <ul className="mt-3 space-y-2">
                  {alerts.map(alert => (
                      <li key={alert.alert_id} className="text-sm text-red-800 bg-red-100 p-2 rounded">
                          <span className="font-semibold">{alert.profiles?.full_name || 'Unknown Patient'}:</span> {alert.message}
                      </li>
                  ))}
              </ul>
          </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><Users className="h-5 w-5"/> Assigned Patients</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{patients.length} Patients</span>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health ID</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {patients.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No patients assigned yet.</td></tr>
                  ) : (
                      patients.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-gray-900">{p.full_name}</td>
                              <td className="px-6 py-4 text-gray-500">{p.email}</td>
                              <td className="px-6 py-4 text-gray-500">{p.health_care_number || 'N/A'}</td>
                              <td className="px-6 py-4 text-right text-sm font-medium">
                                  <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1 justify-end w-full">
                                    <Eye className="h-4 w-4"/> View Data
                                  </button>
                              </td>
                          </tr>
                      ))
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
}