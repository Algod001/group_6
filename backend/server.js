require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Admin Client
// Note: Ensure your SUPABASE_SERVICE_ROLE_KEY in .env is the long string (JWT) 
// found in Supabase Dashboard > Project Settings > API > service_role (secret)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ==========================================
// 1. AI PATTERN DETECTION ALGORITHM
// ==========================================
// Requirement: Detect patterns between food/activity and abnormal readings.
app.post('/api/ai/analyze', async (req, res) => {
  const { patientId } = req.body;

  try {
    // 1. Fetch last 50 readings for this patient
    const { data: readings, error } = await supabase
      .from('blood_sugar_readings')
      .select('*')
      .eq('patient_id', patientId)
      .order('measured_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // 2. Filter for Abnormal readings
    const abnormalReadings = readings.filter(r => r.category === 'Abnormal');
    
    // 3. Frequency Map (Counting triggers)
    const triggerCounts = {};
    
    abnormalReadings.forEach(reading => {
      // Tokenize food and activity (simple lowercase split)
      const inputs = [
        ...(reading.food_intake ? reading.food_intake.toLowerCase().split(',') : []),
        ...(reading.activity ? reading.activity.toLowerCase().split(',') : [])
      ];

      inputs.forEach(item => {
        const cleanItem = item.trim();
        if (cleanItem) {
          triggerCounts[cleanItem] = (triggerCounts[cleanItem] || 0) + 1;
        }
      });
    });

    // 4. Identify Patterns (Logic: If a trigger appears >= 3 times in abnormal readings)
    const detectedPatterns = Object.keys(triggerCounts).filter(key => triggerCounts[key] >= 3);
    
    const recommendations = [];

    // 5. Generate Recommendations based on patterns
    for (const trigger of detectedPatterns) {
      const msg = `We noticed high blood sugar often follows '${trigger}'. Consider reducing portions or avoiding this.`;
      recommendations.push(msg);

      // Check if this recommendation already exists to avoid duplicates
      const { data: existing } = await supabase
        .from('recommendations')
        .select('*')
        .eq('patient_id', patientId)
        .eq('advice', msg);

      if (!existing || existing.length === 0) {
        // Insert into DB
        await supabase.from('recommendations').insert({
          patient_id: patientId,
          advice: msg,
          source: 'AI'
        });
      }
    }

    res.json({ success: true, patterns: detectedPatterns, newRecommendations: recommendations });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. REPORT GENERATION ALGORITHM
// ==========================================
// Requirement: Monthly/Yearly reports with stats.
app.post('/api/reports/generate', async (req, res) => {
  const { year, month } = req.body; // month is optional

  try {
    // 1. Build Date Range
    let startDate, endDate;
    if (month) {
      startDate = new Date(year, month - 1, 1).toISOString();
      endDate = new Date(year, month, 0).toISOString(); // Last day of month
    } else {
      startDate = new Date(year, 0, 1).toISOString();
      endDate = new Date(year, 11, 31).toISOString();
    }

    // 2. Fetch Data
    const { data: readings, error } = await supabase
      .from('blood_sugar_readings')
      .select('value, category, patient_id')
      .gte('measured_at', startDate)
      .lte('measured_at', endDate);

    if (error) throw error;

    // 3. Calculate Statistics
    const totalReadings = readings.length;
    if (totalReadings === 0) return res.json({ message: "No data for this period" });

    const totalPatients = new Set(readings.map(r => r.patient_id)).size;
    const averageSugar = readings.reduce((acc, curr) => acc + curr.value, 0) / totalReadings;
    const highest = Math.max(...readings.map(r => r.value));
    const lowest = Math.min(...readings.map(r => r.value));
    const abnormalCount = readings.filter(r => r.category === 'Abnormal').length;

    // 4. Return Report Data
    const reportData = {
      type: month ? 'Monthly' : 'Yearly',
      period: `${year}-${month || 'All'}`,
      total_active_patients: totalPatients,
      avg_sugar_level: averageSugar.toFixed(2),
      highest_reading: highest,
      lowest_reading: lowest,
      abnormal_count: abnormalCount
    };

    res.json({ success: true, report: reportData });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. ADMIN: CREATE SPECIALIST/STAFF
// ==========================================
// Requirement: Admins manage accounts.
app.post('/api/admin/create-user', async (req, res) => {
  const { email, password, fullName, role, workingId } = req.body;

  try {
    // 1. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (authError) throw authError;

    // 2. Update the 'role' and 'working_id' in the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: role, working_id: workingId })
      .eq('id', authData.user.id);

    if (profileError) throw profileError;

    res.json({ success: true, user: authData.user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));