import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileBarChart, Users, Edit, Save, X } from 'lucide-react';

export default function AdminDashboard() {
  // State
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // ID of user being edited
  const [editForm, setEditForm] = useState({});
  const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', role: 'specialist' });
  const [loading, setLoading] = useState(false);

  // 1. Fetch Users on Load
  const fetchUsers = async () => {
    try {
        const res = await fetch('http://localhost:5001/api/admin/users');
        const data = await res.json();
        if (data.success) setUsers(data.data);
    } catch (err) {
        console.error("Failed to fetch users");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. Generate Report
  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: 2025 })
      });
      const data = await res.json();
      if (data.success) setReport(data.report);
    } catch (err) {
      alert("Report generation failed");
    } finally {
      setLoading(false);
    }
  };

  // 3. Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await fetch('http://localhost:5001/api/admin/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        alert("User Created");
        setNewUser({ email: '', password: '', fullName: '', role: 'specialist' });
        fetchUsers(); // Refresh list
    } catch (err) {
        alert("Error creating user");
    } finally {
        setLoading(false);
    }
  };

  // 4. Edit User Logic
  const startEdit = (user) => {
      setEditingUser(user.id);
      setEditForm({ ...user });
  };

  const saveEdit = async () => {
      try {
          const res = await fetch('http://localhost:5001/api/admin/update-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  userId: editingUser,
                  fullName: editForm.full_name,
                  role: editForm.role,
                  email: editForm.email
              })
          });
          if (res.ok) {
              setEditingUser(null);
              fetchUsers();
          }
      } catch (err) {
          alert("Update failed");
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Administrator Console</h1>

      {/* REPORT SECTION */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileBarChart/> Clinic Reports</CardTitle></CardHeader>
        <CardContent>
            <Button onClick={generateReport} disabled={loading}>
                {loading ? "Generating..." : "Generate 2025 Report"}
            </Button>
            
            {report && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded border">
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Active Patients</p>
                        <p className="text-2xl font-bold">{report.total_patients}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Avg Glucose</p>
                        <p className="text-2xl font-bold text-blue-600">{report.avg_sugar}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Abnormal Events</p>
                        <p className="text-2xl font-bold text-red-600">{report.abnormal_count}</p>
                    </div>
                    <div className="col-span-2 md:col-span-4 border-t pt-2 mt-2">
                        <p className="text-xs text-gray-500 uppercase">Top Triggers (AI Detected)</p>
                        <p className="font-medium text-slate-700">{report.top_triggers}</p>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      {/* USER MANAGEMENT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create User Form */}
        <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Create New User</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-3">
                    <Input placeholder="Full Name" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} required />
                    <Input placeholder="Email" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                    <Input placeholder="Password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                    <select className="w-full border p-2 rounded" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                        <option value="specialist">Specialist</option>
                        <option value="staff">Clinic Staff</option>
                        <option value="administrator">Administrator</option>
                    </select>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Create User</Button>
                </form>
            </CardContent>
        </Card>

        {/* User List & Edit */}
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><Users/> User Management</CardTitle></CardHeader>
            <CardContent>
                <div className="max-h-[400px] overflow-y-auto border rounded">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 font-medium">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b">
                                    <td className="p-3">
                                        {editingUser === u.id ? (
                                            <Input value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} />
                                        ) : u.full_name}
                                    </td>
                                    <td className="p-3">
                                        {editingUser === u.id ? (
                                            <select className="border p-1 rounded" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                                                <option value="patient">Patient</option>
                                                <option value="specialist">Specialist</option>
                                                <option value="staff">Staff</option>
                                                <option value="administrator">Admin</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs uppercase font-bold ${u.role === 'administrator' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}>
                                                {u.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {editingUser === u.id ? (
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={saveEdit} className="bg-blue-600 h-8 w-8 p-0"><Save size={14}/></Button>
                                                <Button size="sm" variant="outline" onClick={() => setEditingUser(null)} className="h-8 w-8 p-0"><X size={14}/></Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="ghost" onClick={() => startEdit(u)}><Edit size={14}/></Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}