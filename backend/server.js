require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Controllers
const aiController = require('./controllers/aiController');
const adminController = require('./controllers/adminController');
const staffController = require('./controllers/staffController');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
app.locals.supabase = supabase;

// --- ROUTES ---

// 1. AI & Analysis
app.post('/api/ai/analyze', aiController.analyzePattern);

// 2. Admin: User Management
app.post('/api/admin/create-user', adminController.createUser);

app.get('/api/admin/users', async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    res.json({ success: true, users: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) throw authError;
    // Profile is usually deleted via Cascade, but we can ensure it here
    await supabase.from('profiles').delete().eq('id', id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Staff: Thresholds
app.get('/api/staff/thresholds', staffController.getThresholds);
app.post('/api/staff/thresholds/update', staffController.updateThreshold);

// 4. Reporting
app.post('/api/reports/generate', async (req, res) => {
  const { year } = req.body;
  console.log("Generating report for:", year);

  try {
    const startDate = new Date(year, 0, 1).toISOString();
    const endDate = new Date(year, 11, 31).toISOString();
    
    // Fetch readings
    const { data: readings, error } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (error) throw error;

    // Safe Calculations
    const totalReadings = readings.length;
    const totalPatients = new Set(readings.map(r => r.patient_id)).size;
    
    const avgSugar = totalReadings > 0 
      ? readings.reduce((acc, r) => acc + (r.value || 0), 0) / totalReadings 
      : 0;

    const highest = totalReadings > 0 ? Math.max(...readings.map(r => r.value)) : 0;
    const lowest = totalReadings > 0 ? Math.min(...readings.map(r => r.value)) : 0;
    const abnormalCount = readings.filter(r => r.category === 'Abnormal').length;

    res.json({
      success: true,
      report: {
        period: year,
        total_active_patients: totalPatients,
        avg_sugar_level: avgSugar.toFixed(1),
        abnormal_count: abnormalCount,
        highest_reading: highest,
        lowest_reading: lowest
      }
    });

  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate report" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));