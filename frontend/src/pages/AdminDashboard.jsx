import { useState } from 'react';
import { UserPlus, FileBarChart, Download, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', role: 'specialist' });
  const [loadingUser, setLoadingUser] = useState(false);

  const generateReport = async () => {
    setLoadingReport(true);
    try {
      const res = await fetch('http://localhost:5001/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: new Date().getFullYear() })
      });
      const data = await res.json();
      if (data.success) setReport(data.report);
    } catch (err) {
      alert("Backend offline");
    } finally {
      setLoadingReport(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setLoadingUser(true);
    try {
      const res = await fetch('http://localhost:5001/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        alert("User created successfully!");
        setNewUser({ email: '', password: '', fullName: '', role: 'specialist' });
      } else {
        alert("Error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Failed to connect to server");
    } finally {
      setLoadingUser(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Administrator Console</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-700">
            <FileBarChart className="text-blue-600 h-6 w-6"/> Analytics & Reports
          </h2>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Yearly Clinic Overview</h3>
            <button
                onClick={generateReport}
                disabled={loadingReport}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
                <Download className="h-4 w-4"/> {loadingReport ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {report && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded border text-center">
                        <div className="text-3xl font-bold text-slate-800">{report.total_active_patients}</div>
                        <div className="text-xs uppercase font-semibold text-slate-500 mt-1">Active Patients</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded border border-red-100 text-center">
                        <div className="text-3xl font-bold text-red-600">{report.abnormal_count}</div>
                        <div className="text-xs uppercase font-semibold text-red-500 mt-1">Abnormal Events</div>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded border">
                    <div className="text-sm text-slate-500 uppercase font-semibold mb-2">AI Insights: Top Triggers</div>
                    <p className="text-slate-800 font-medium">{report.top_triggers}</p>
                </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-700">
            <UserPlus className="text-green-600 h-6 w-6"/> Create Staff Account
          </h2>
          <form onSubmit={createUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text" required className="w-full border p-2.5 rounded"
                value={newUser.fullName}
                onChange={e => setNewUser({...newUser, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email" required className="w-full border p-2.5 rounded"
                value={newUser.email}
                onChange={e => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password" required className="w-full border p-2.5 rounded"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    className="w-full border p-2.5 rounded bg-white"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="specialist">Specialist</option>
                    <option value="staff">Clinic Staff</option>
                    <option value="administrator">Administrator</option>
                  </select>
                </div>
            </div>
            <button
              type="submit"
              disabled={loadingUser}
              className="w-full bg-green-600 text-white py-2.5 rounded hover:bg-green-700 mt-2 flex justify-center items-center gap-2"
            >
              {loadingUser ? "Creating Account..." : <><CheckCircle className="h-4 w-4"/> Create Account</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}