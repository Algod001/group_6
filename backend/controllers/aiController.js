const analyzePattern = async (req, res) => {
  const { patientId } = req.body;
  const supabase = req.app.locals.supabase;

  try {
    // 1. Fetch last 50 readings
    const { data: readings, error } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .eq('patient_id', patientId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;

    // 2. Filter for Abnormal (High or Low)
    const abnormalReadings = readings.filter(r => r.category === 'Abnormal');
    
    console.log(`AI Analysis: Found ${abnormalReadings.length} abnormal readings for Patient ${patientId}`);

    // 3. Pattern Detection Algorithm (Frequency Counting)
    const triggerMap = {};

    abnormalReadings.forEach(r => {
      // Combine food and activity into one text stream
      const text = `${r.food_intake || ''} ${r.activity || ''}`.toLowerCase();
      
      // Simple Tokenization: Split by comma or space
      const tokens = text.split(/[\s,]+/).filter(t => t.length > 2); // Ignore small words

      tokens.forEach(token => {
        triggerMap[token] = (triggerMap[token] || 0) + 1;
      });
    });

    // 4. The "Rule of 3" Check
    const patterns = Object.keys(triggerMap).filter(trigger => triggerMap[trigger] >= 3);

    const newRecommendations = [];

    for (const trigger of patterns) {
      const msg = `High blood sugar frequency detected associated with '${trigger}'. Consider adjusting habits.`;
      
      // Check if we already gave this advice
      const { data: existing } = await supabase
        .from('recommendations')
        .select('*')
        .eq('patient_id', patientId)
        .eq('advice', msg);

      if (!existing || existing.length === 0) {
        // Save to Database
        const { error: insertError } = await supabase.from('recommendations').insert({
          patient_id: patientId,
          advice: msg,
          source: 'AI'
        });
        if (!insertError) newRecommendations.push(msg);
      }
    }

    res.json({ 
      success: true, 
      analyzed: abnormalReadings.length,
      patternsFound: patterns, 
      newRecommendations 
    });

  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { analyzePattern };