require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// FIX: Use single dot ./ to look inside the current backend folder
const aiController = require('./controllers/aiController'); 

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Make supabase available to controllers
app.locals.supabase = supabase;

// --- ROUTES ---

// 1. AI Pattern Detection
app.post('/api/ai/analyze', aiController.analyzePattern);

// 2. Report Generation
app.post('/api/reports/generate', async (req, res) => {
  const { year } = req.body;
  const sb = req.app.locals.supabase;
  
  // Fetch all readings for the year
  const startDate = new Date(year, 0, 1).toISOString();
  const endDate = new Date(year, 11, 31).toISOString();
  
  const { data: readings, error } = await sb
    .from('blood_sugar_reading')
    .select('*')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate);

  if (error) return res.status(500).json({ error: error.message });

  // Calculate Stats
  const totalPatients = new Set(readings.map(r => r.patient_id)).size;
  const avgSugar = readings.reduce((acc, r) => acc + r.value, 0) / (readings.length || 1);
  const abnormal = readings.filter(r => r.category === 'Abnormal').length;

  res.json({
    success: true,
    report: {
      period: year,
      total_active_patients: totalPatients,
      avg_sugar_level: avgSugar.toFixed(1),
      abnormal_count: abnormal,
      highest_reading: Math.max(...readings.map(r => r.value), 0),
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));