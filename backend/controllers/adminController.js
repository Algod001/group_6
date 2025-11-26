exports.createUser = async (req, res) => {
    const { email, password, role, fullName } = req.body;
    const supabase = req.app.locals.supabase;
  
    try {
      // 1. Create User in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: { full_name: fullName, role: role }
      });
  
      if (authError) throw authError;
  
      // 2. Create Profile Entry (if your DB triggers don't handle it automatically)
      // We insert into 'profiles' or 'specialists'/'staff' tables based on your SDD
      // For simplicity, we ensure the 'profiles' table has the correct role.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: authData.user.id, 
          email: email, 
          role: role,
          full_name: fullName 
        });
  
      if (profileError) throw profileError;
  
      res.json({ success: true, message: `Created ${role}: ${email}` });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };