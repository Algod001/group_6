const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Admin Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.analyzePattern = async (req, res) => {
  const { patientId } = req.body;

  try {
    // 1. Fetch last 20 readings for this patient
    const { data: readings, error } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .eq('patient_id', patientId)
      .order('timestamp', { ascending: false })
      .limit(20);

    if (error) throw error;

    const recommendations = [];

    // 2. Analyze Data
    if (!readings || readings.length === 0) {
        recommendations.push("Welcome! Log your first reading to start receiving AI insights.");
    } else {
        // Filter for Abnormal readings
        const abnormalReadings = readings.filter(r => r.category === 'Abnormal');

        // 3. Look for Specific Food Patterns (Rule of 3)
        const triggerCounts = {};
        abnormalReadings.forEach(reading => {
          const inputs = [
            ...(reading.food_intake ? reading.food_intake.toLowerCase().split(',') : []),
            ...(reading.activity ? reading.activity.toLowerCase().split(',') : [])
          ];
          inputs.forEach(item => {
            const cleanItem = item.trim();
            if (cleanItem) triggerCounts[cleanItem] = (triggerCounts[cleanItem] || 0) + 1;
          });
        });

        const detectedPatterns = Object.keys(triggerCounts).filter(key => triggerCounts[key] >= 3);

        // --- TIER 1: Specific Patterns Found ---
        if (detectedPatterns.length > 0) {
            for (const trigger of detectedPatterns) {
                recommendations.push(`Alert: Your sugar tends to spike after '${trigger}'. Try reducing the portion size.`);
            }
        } 
        // --- TIER 2: No specific pattern, but High Readings ---
        else if (abnormalReadings.length > 0) {
            recommendations.push("We noticed some instability. Try a 15-minute walk after meals to help regulate your levels.");
        } 
        // --- TIER 3: All Good (Positive Reinforcement) ---
        else {
            recommendations.push("Great job! Your recent readings are stable. Keep up the consistent routine.");
        }
    }

    // 4. Save to Database (Avoid Duplicates)
    const newSavedRecs = [];
    for (const msg of recommendations) {
      // Check if this EXACT message was sent in the last 24 hours
      const { data: existing } = await supabase
        .from('recommendations')
        .select('*')
        .eq('patient_id', patientId)
        .eq('advice', msg)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24h check

      if (!existing || existing.length === 0) {
        const { data: inserted } = await supabase.from('recommendations').insert({
          patient_id: patientId,
          advice: msg,
          source: 'AI'
        }).select();
        if(inserted) newSavedRecs.push(inserted[0]);
      }
    }

    res.json({ success: true, newRecommendations: newSavedRecs });

  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: err.message });
  }
};