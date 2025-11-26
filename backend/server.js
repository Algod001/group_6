require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Supabase Admin Client (For Backend Logic)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// --- AI CONTROLLER LOGIC ---
// (We put it here to keep it simple and runnable in one file for now)
app.post('/api/ai/analyze', async (req, res) => {
  const { patientId } = req.body;
  console.log("Analyzing for:", patientId);

  try {
    // 1. Fetch last 50 readings
    const { data: readings, error } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .eq('patient_id', patientId)
      .order('measured_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // 2. Detect Patterns (Frequency of High Sugar + Food)
    const abnormalReadings = readings.filter(r => r.category === 'Abnormal');
    const triggerCounts = {};
    
    abnormalReadings.forEach(reading => {
      // Combine food and activity into one list
      const inputs = [
        ...(reading.food_intake ? reading.food_intake.toLowerCase().split(',') : []),
        ...(reading.activity ? reading.activity.toLowerCase().split(',') : [])
      ];

      inputs.forEach(item => {
        const cleanItem = item.trim();
        if (cleanItem) triggerCounts[cleanItem] = (triggerCounts[cleanItem] || 0) + 1;
      });
    });

    // 3. Generate Advice if pattern found (> 2 times)
    const detectedPatterns = Object.keys(triggerCounts).filter(key => triggerCounts[key] > 2);
    const recommendations = [];

    for (const trigger of detectedPatterns) {
      const msg = `We noticed high blood sugar often follows '${trigger}'. Consider reducing this.`;
      
      // Check if we already gave this advice
      const { data: existing } = await supabase
        .from('recommendations')
        .select('*')
        .eq('patient_id', patientId)
        .eq('advice', msg);

      if (!existing || existing.length === 0) {
        await supabase.from('recommendations').insert({
          patient_id: patientId,
          advice: msg,
          source: 'AI'
        });
        recommendations.push(msg);
      }
    }

    res.json({ success: true, patterns: detectedPatterns, new_recommendations: recommendations });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN: GENERATE REPORT ---
app.post('/api/reports/generate', async (req, res) => {
    // Simple mock report logic for the Admin Dashboard
    const { year } = req.body;
    // In a real app, you'd run a complex SQL query here
    res.json({ 
        success: true, 
        report: { 
            total_active_patients: 15, 
            avg_sugar_level: 140, 
            abnormal_count: 5,
            period: `${year}`
        } 
    });
});


const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));