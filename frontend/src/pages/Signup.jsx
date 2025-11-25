import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // All fields required by your 'profiles' table
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', phone: '',
    healthcareNumber: '', dateOfBirth: '', gender: 'Male'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;

      // 2. Create Profile Entry with EXTRA FIELDS
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            phone_number: formData.phone,
            healthcare_number: formData.healthcareNumber,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            role: 'patient' // Force role to patient for public signup
        });
        if (profileError) throw profileError;
      }

      alert("Account created! Please log in.");
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">Patient Registration</h2>
        <form className="mt-8 space-y-4" onSubmit={handleSignup}>
          <input name="fullName" type="text" required placeholder="Full Name" onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="email" type="email" required placeholder="Email" onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="password" type="password" required placeholder="Password" onChange={handleChange} className="w-full border p-2 rounded" />
          
          {/* Missing Fields Added Below */}
          <input name="healthcareNumber" type="text" required placeholder="Healthcare Number" onChange={handleChange} className="w-full border p-2 rounded" />
          <div className="flex gap-2">
            <input name="dateOfBirth" type="date" required onChange={handleChange} className="w-1/2 border p-2 rounded" />
            <select name="gender" onChange={handleChange} className="w-1/2 border p-2 rounded">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
          </div>
          <input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} className="w-full border p-2 rounded" />

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center mt-4">
            <Link to="/login" className="text-indigo-600 hover:underline">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}