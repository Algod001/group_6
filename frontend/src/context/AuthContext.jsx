import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch the role from the 'profiles' table
  const fetchProfile = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "Row not found" errors initially
        console.error("Profile Fetch Error:", error);
      }
      
      // Combine Auth User + Database Profile
      // If profile exists, use its role. If not, default to 'patient' to prevent crashes.
      const mergedUser = { 
        ...authUser, 
        ...profile, 
        role: profile?.role || 'patient' 
      };
      
      setUser(mergedUser);
    } catch (err) {
      console.error("Unexpected Auth Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check active session on startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // 2. Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Only fetch if we switched users to prevent loops
        fetchProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);