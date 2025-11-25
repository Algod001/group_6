// This file handles ONLY the AI Logic
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Algorithm: Detect Patterns
exports.analyzePatterns = async (req, res) => {
  const { patientId } = req.body;

  try {
    // 1. Fetch last 50 readings
    const { data: readings, error } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .eq('patient_id', patientId)
      .order('measured_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // 2. Filter Abnormal
    const abnormalReadings = readings.filter(r => r.category === 'Abnormal');

    // 3. Frequency Analysis (Counting triggers)
    const triggerCounts = {};
    abnormalReadings.forEach(reading => {
      // Combine food and activity into one list of potential triggers
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

    // 4. Threshold Check (If trigger appears >= 3 times)
    const detectedPatterns = Object.keys(triggerCounts).filter(key => triggerCounts[key] >= 3);
    
    // 5. Generate Recommendations
    const recommendations = [];
    for (const trigger of detectedPatterns) {
      const msg = `Recurring spike detected after '${trigger}'. Consider adjusting intake.`;
      
      // Save to DB if new
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
    console.error("AI Error:", err);
    res.status(500).json({ error: err.message });
  }
};