const supabase = require('@supabase/supabase-js').createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ALGORITHM 2: Report Generation (Monthly/Yearly)
exports.generateReport = async (req, res) => {
  const { year, month } = req.body;

  try {
    // 1. Define Time Range
    let startDate, endDate;
    if (month) {
      startDate = new Date(year, month - 1, 1).toISOString();
      endDate = new Date(year, month, 0).toISOString();
    } else {
      startDate = new Date(year, 0, 1).toISOString();
      endDate = new Date(year, 11, 31).toISOString();
    }

    // 2. Fetch All Data for Period
    const { data: readings, error } = await supabase
      .from('blood_sugar_reading')
      .select('value, category, patient_id, food_intake, activity')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (error) throw error;

    if (!readings || readings.length === 0) {
      return res.json({ success: true, report: null, message: "No data found" });
    }

    // 3. Calculate Stats
    const totalReadings = readings.length;
    const uniquePatients = new Set(readings.map(r => r.patient_id)).size;
    const abnormalReadings = readings.filter(r => r.category === 'Abnormal');
    
    const avgSugar = readings.reduce((sum, r) => sum + r.value, 0) / totalReadings;
    const highest = Math.max(...readings.map(r => r.value));
    const lowest = Math.min(...readings.map(r => r.value));

    // 4. "Top Triggers" Algorithm (Word Frequency in Abnormal Readings)
    const triggerMap = {};
    abnormalReadings.forEach(r => {
      const text = (r.food_intake + " " + r.activity).toLowerCase();
      const words = text.split(/[\s,]+/);
      words.forEach(w => {
        if (w.length > 3 && !['with', 'after', 'before', 'some'].includes(w)) {
          triggerMap[w] = (triggerMap[w] || 0) + 1;
        }
      });
    });

    // Sort by frequency and take top 3
    const topTriggers = Object.entries(triggerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0])
      .join(', ');

    const reportData = {
      total_active_patients: uniquePatients,
      avg_sugar_level: avgSugar.toFixed(1),
      highest_reading: highest,
      lowest_reading: lowest,
      abnormal_count: abnormalReadings.length,
      top_triggers: topTriggers || "None detected"
    };

    res.json({ success: true, report: reportData });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Account (Admin/Staff/Specialist)
exports.createUser = async (req, res) => {
  const { email, password, fullName, role } = req.body;
  try {
    // 1. Create in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role } // Store role in metadata
    });

    if (authError) throw authError;

    // 2. Create in Public Profiles (Trigger usually handles this, but we ensure role is set)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: role, full_name: fullName })
      .eq('id', authData.user.id);

    res.json({ success: true, user: authData.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Modify User (Update Profile)
exports.updateUser = async (req, res) => {
    const { userId, updates } = req.body;
    try {
        const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
        if(error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}