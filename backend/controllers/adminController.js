// 1. Create User
exports.createUser = async (req, res) => {
  const { email, password, fullName, role } = req.body;
  const supabase = req.app.locals.supabase;

  try {
    // A. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (authError) throw authError;

    // B. Create Profile Entry (or update if trigger created it)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: role, full_name: fullName })
      .eq('id', authData.user.id);

    if (profileError) {
        // If update failed, maybe insert?
        await supabase.from('profiles').insert({
            id: authData.user.id,
            email: email,
            role: role,
            full_name: fullName
        });
    }

    res.json({ success: true, user: authData.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 2. Edit User (NEW)
exports.updateUser = async (req, res) => {
    const { userId, fullName, role, email } = req.body;
    const supabase = req.app.locals.supabase;

    try {
        // Update Profile Table
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: fullName, role: role, email: email })
            .eq('id', userId);
        
        if (error) throw error;

        // Ideally update Auth email too, but that requires re-verification logic
        // For this scope, we just update the profile data.

        res.json({ success: true, message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Get All Users (NEW)
exports.getAllUsers = async (req, res) => {
    const supabase = req.app.locals.supabase;
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data });
};

// 4. Generate Report (Algorithm 2)
exports.generateReport = async (req, res) => {
  const { year, month } = req.body;
  const supabase = req.app.locals.supabase;

  try {
    // A. Define Timeframe
    let startDate, endDate;
    if (month) {
        startDate = new Date(year, month - 1, 1).toISOString();
        endDate = new Date(year, month, 0).toISOString();
    } else {
        startDate = new Date(year, 0, 1).toISOString();
        endDate = new Date(year, 11, 31).toISOString();
    }

    // B. Fetch Data
    const { data: readings, error } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (error) throw error;

    if (!readings || readings.length === 0) {
        return res.json({ success: true, report: { message: "No data for this period" }});
    }

    // C. Calculate Stats
    const totalReadings = readings.length;
    const uniquePatients = new Set(readings.map(r => r.patient_id)).size;
    const avgSugar = readings.reduce((acc, r) => acc + r.value, 0) / totalReadings;
    const highest = Math.max(...readings.map(r => r.value));
    const lowest = Math.min(...readings.map(r => r.value));
    
    // D. Algorithm: Top Triggers (Frequency Count)
    const abnormalReadings = readings.filter(r => r.category === 'Abnormal');
    const triggerMap = {};
    abnormalReadings.forEach(r => {
        const words = `${r.food_intake} ${r.activity}`.toLowerCase().split(/[\s,]+/);
        words.forEach(w => {
            if(w.length > 3) triggerMap[w] = (triggerMap[w] || 0) + 1;
        });
    });
    
    // Sort triggers by frequency
    const topTriggers = Object.entries(triggerMap)
        .sort((a, b) => b[1] - a[1]) // Sort descending
        .slice(0, 3) // Top 3
        .map(entry => `${entry[0]} (${entry[1]})`)
        .join(', ');

    const reportData = {
      period: `${year}-${month || 'All'}`,
      total_patients: uniquePatients,
      avg_sugar: avgSugar.toFixed(1),
      highest,
      lowest,
      abnormal_count: abnormalReadings.length,
      top_triggers: topTriggers || "None detected"
    };

    res.json({ success: true, report: reportData });

  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).json({ error: err.message });
  }
};