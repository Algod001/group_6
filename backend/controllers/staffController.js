exports.updateThreshold = async (req, res) => {
    const { category, min, max, staffId } = req.body; // staffId tracks WHO changed it
    const supabase = req.app.locals.supabase;
  
    try {
      // Update the 'category_threshold' table from your SDD
      const { error } = await supabase
        .from('category_threshold')
        .update({ min_value: min, max_value: max, created_by: staffId, last_update: new Date() })
        .eq('name', category);
  
      if (error) throw error;
  
      res.json({ success: true, message: `Updated ${category} range to ${min}-${max}` });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.getThresholds = async (req, res) => {
    const supabase = req.app.locals.supabase;
    const { data, error } = await supabase.from('category_threshold').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data });
  };

  const adminController = require('./controllers/adminController');
  const staffController = require('./controllers/staffController');
  
  // ... existing middleware and supabase setup ...
  
  // --- EXISTING ROUTES ---
  app.post('/api/ai/analyze', aiController.analyzePattern);
  app.post('/api/reports/generate', /* ... existing report code ... */);
  
  // --- NEW ROUTES (ADD THESE) ---
  
  // Admin: Create User
  app.post('/api/admin/create-user', adminController.createUser);
  
  // Staff: Thresholds
  app.get('/api/staff/thresholds', staffController.getThresholds);
  app.post('/api/staff/thresholds/update', staffController.updateThreshold);
  

  import { useState, useEffect } from 'react';
  import { Save, Activity } from 'lucide-react';
  
  export default function StaffDashboard() {
    const [thresholds, setThresholds] = useState([]);
    const [loading, setLoading] = useState(false);
  
    // Mock initial load or fetch from API
    useEffect(() => {
      fetch('http://localhost:5000/api/staff/thresholds')
        .then(res => res.json())
        .then(data => {
          if(data.success && data.data.length > 0) setThresholds(data.data);
          else {
              // Fallback if DB is empty
              setThresholds([
                  { id: 1, name: 'Normal', min_value: 70, max_value: 130 },
                  { id: 2, name: 'Abnormal', min_value: 0, max_value: 70 },
                  { id: 3, name: 'Borderline', min_value: 130, max_value: 180 }
              ]);
          }
        });
    }, []);
  
    const handleUpdate = async (t) => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/staff/thresholds/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              category: t.name, 
              min: t.min_value, 
              max: t.max_value,
              staffId: 1 // Ideally fetch from user session
          })
        });
        const data = await res.json();
        if(data.success) alert("Updated successfully!");
      } catch(err) {
        alert("Error updating threshold");
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-purple-900">Clinic Staff Dashboard</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="text-purple-600"/> System Threshold Configuration
          </h2>
          <p className="text-gray-600 mb-6">Configure the blood sugar ranges used by the AI Engine.</p>
  
          <div className="space-y-4">
            {thresholds.map((t, idx) => (
              <div key={idx} className="flex items-center gap-4 border-b pb-4">
                <div className="w-32 font-bold">{t.name}</div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Min:</span>
                  <input 
                    type="number" 
                    className="border p-2 rounded w-24"
                    value={t.min_value}
                    onChange={(e) => {
                      const newT = [...thresholds];
                      newT[idx].min_value = Number(e.target.value);
                      setThresholds(newT);
                    }}
                  />
                </div>
  
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Max:</span>
                  <input 
                    type="number" 
                    className="border p-2 rounded w-24"
                    value={t.max_value}
                    onChange={(e) => {
                      const newT = [...thresholds];
                      newT[idx].max_value = Number(e.target.value);
                      setThresholds(newT);
                    }}
                  />
                </div>
  
                <button 
                  onClick={() => handleUpdate(t)}
                  disabled={loading}
                  className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
                >
                  <Save size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  // ... existing imports (useState, etc) ...
  import { useState } from 'react';
  import { UserPlus, FileBarChart } from 'lucide-react';
  
  export default function AdminDashboard() {
    // ... keep existing report logic ...
    const [report, setReport] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);
  
    // NEW: User Creation State
    const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', role: 'specialist' });
    const [loadingUser, setLoadingUser] = useState(false);
  
    // ... keep generateReport function ...
     const generateReport = async () => {
      setLoadingReport(true);
      try {
        const res = await fetch('http://localhost:5000/api/reports/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year: 2024 })
        });
        const data = await res.json();
        if (data.success) setReport(data.report);
      } catch (err) {
        alert("Backend offline");
      } finally {
        setLoadingReport(false);
      }
    };
  
    // NEW: Create User Function
    const createUser = async (e) => {
      e.preventDefault();
      setLoadingUser(true);
      try {
        const res = await fetch('http://localhost:5000/api/admin/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        const data = await res.json();
        if (data.success) {
          alert("User created successfully!");
          setNewUser({ email: '', password: '', fullName: '', role: 'specialist' });
        } else {
          alert("Error: " + data.error);
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
          
          {/* 1. Report Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileBarChart className="text-blue-600"/> Reports
            </h2>
            <button 
               onClick={generateReport} 
               disabled={loadingReport}
               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loadingReport ? "Generating..." : "Generate Yearly Report"}
            </button>
            
            {/* Report Display */}
            {report && (
              <div className="mt-6 p-4 bg-slate-50 rounded border">
                  <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                          <div className="text-2xl font-bold">{report.total_active_patients}</div>
                          <div className="text-xs uppercase text-gray-500">Active Patients</div>
                      </div>
                      <div>
                          <div className="text-2xl font-bold text-red-600">{report.abnormal_count}</div>
                          <div className="text-xs uppercase text-gray-500">Abnormal Events</div>
                      </div>
                  </div>
              </div>
            )}
          </div>
  
          {/* 2. Create User Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UserPlus className="text-green-600"/> Create Staff Account
            </h2>
            <form onSubmit={createUser} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                      type="text" required className="w-full border p-2 rounded"
                      value={newUser.fullName}
                      onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                      type="email" required className="w-full border p-2 rounded"
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input 
                          type="password" required className="w-full border p-2 rounded"
                          value={newUser.password}
                          onChange={e => setNewUser({...newUser, password: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select 
                          className="w-full border p-2 rounded bg-white"
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
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                  {loadingUser ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }