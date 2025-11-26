import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'patient',
    gender: 'Male',
    healthcareNumber: '',
    dob: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role
          }
        }
      });

      if (authError) throw authError;

      // 2. Update profile with extra fields if patient
      // Note: Supabase trigger usually creates the initial profile row. We update it here.
      if (formData.role === 'patient' && authData.user) {
         const { error: profileError } = await supabase.from('profiles').update({
            gender: formData.gender,
            healthcare_number: formData.healthcareNumber,
            date_of_birth: formData.dob
         }).eq('id', authData.user.id);
         
         if (profileError) console.error("Profile update error:", profileError);
      }

      alert("Account created! Please check your email or log in.");
      navigate('/login');

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-10">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full p-2 border rounded"
            onChange={e => setFormData({...formData, fullName: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full p-2 border rounded"
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full p-2 border rounded"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          
          <div>
            <label className="block text-sm font-bold mb-1">Role</label>
            <select 
              className="w-full p-2 border rounded"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="patient">Patient</option>
              <option value="specialist">Specialist</option>
            </select>
          </div>

          {formData.role === 'patient' && (
            <div className="space-y-4 border-t pt-4 mt-2">
              <p className="text-sm font-semibold text-gray-500">Patient Details</p>
              <div className="grid grid-cols-2 gap-2">
                 <select className="border p-2 rounded" onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                 </select>
                 <input type="date" required className="border p-2 rounded" onChange={e => setFormData({...formData, dob: e.target.value})} />
              </div>
              <input 
                type="text" 
                placeholder="Healthcare Number" 
                required 
                className="w-full p-2 border rounded"
                onChange={e => setFormData({...formData, healthcareNumber: e.target.value})}
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-2 text-white bg-green-600 rounded hover:bg-green-700">
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </div>
    </div>
  );
}