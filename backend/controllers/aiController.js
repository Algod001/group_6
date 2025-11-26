const supabase = require('@supabase/supabase-js').createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ALGORITHM 1: Pattern Detection & Alert Trigger
exports.analyzePattern = async (req, res) => {
  const { patientId } = req.body;

  try {
    // 1. Fetch last 7 days of readings
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: readings, error } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .eq('patient_id', patientId)
      .gte('timestamp', oneWeekAgo.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;

    // 2. Count Abnormalities (The "3 Strikes" Rule)
    const abnormalReadings = readings.filter(r => r.category === 'Abnormal');
    
    if (abnormalReadings.length >= 3) {
      // REQUIREMENT: Notify Specialist (Create an Alert Record)
      // First, find the assigned specialist
      const { data: assignment } = await supabase
        .from('patient_specialist_assignment')
        .select('specialist_id')
        .eq('patient_id', patientId)
        .single();

      if (assignment) {
         // Check if alert already sent today to avoid spam
         const { data: existing } = await supabase
           .from('alerts')
           .select('*')
           .eq('patient_id', patientId)
           .gte('timestamp', new Date().toISOString().split('T')[0]); // Today

         if (!existing || existing.length === 0) {
           await supabase.from('alerts').insert({
             patient_id: patientId,
             specialist_id: assignment.specialist_id,
             message: `Patient has recorded ${abnormalReadings.length} abnormal readings this week. Immediate review recommended.`,
             severity_level: 'High',
             status: 'Pending'
           });
         }
      }
    }

    // 3. Pattern Recognition (Simple Frequency Match)
    // Logic: Check if specific foods appear frequently in abnormal readings
    const triggerCounts = {};
    abnormalReadings.forEach(r => {
       if(r.food_intake) {
         const foods = r.food_intake.toLowerCase().split(/[\s,]+/); // Split by space or comma
         foods.forEach(f => {
           if(f.length > 2) triggerCounts[f] = (triggerCounts[f] || 0) + 1;
         });
       }
    });

    // If a food appears in >50% of abnormal readings, flag it
    const patterns = Object.keys(triggerCounts).filter(food => triggerCounts[food] > 1);
    
    // Save Recommendations
    if (patterns.length > 0) {
      const advice = `AI Insight: High sugar levels often follow intake of: ${patterns.join(', ')}. Try reducing these.`;
      // Avoid duplicate advice
      const {data: hasRec} = await supabase.from('recommendations').select('*').eq('advice', advice).eq('patient_id', patientId);
      if(!hasRec || hasRec.length === 0) {
        await supabase.from('recommendations').insert({
          patient_id: patientId,
          advice: advice,
          source: 'AI'
        });
      }
    }

    res.json({ success: true, patterns });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};