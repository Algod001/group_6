import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ full_name: '', phone_number: '' });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if(user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if(data) setProfile(data);
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('profiles').update({
            full_name: profile.full_name,
            phone_number: profile.phone_number
        }).eq('id', user.id);
        
        if(error) setMsg("Error updating");
        else setMsg("Profile updated successfully!");
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow relative">
            <button onClick={() => navigate(-1)} className="absolute top-4 right-4 text-sm text-gray-500 hover:text-gray-800">Back</button>
            <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
            {msg && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{msg}</div>}
            
            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700">Full Name</label>
                    <input type="text" className="w-full border p-2 rounded mt-1" 
                        value={profile.full_name || ''} 
                        onChange={e => setProfile({...profile, full_name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700">Phone Number</label>
                    <input type="text" className="w-full border p-2 rounded mt-1" 
                        value={profile.phone_number || ''} 
                        onChange={e => setProfile({...profile, phone_number: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700">Email (Read Only)</label>
                    <input type="text" disabled className="w-full border p-2 rounded mt-1 bg-gray-100 text-gray-500" 
                        value={user?.email || ''} />
                </div>
                <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Save Changes</button>
            </form>
        </div>
    );
}