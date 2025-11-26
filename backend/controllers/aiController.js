exports.analyzePattern = async (req, res) => {
  const { patientId } = req.body;
  const supabase = req.app.locals.supabase;

  try {
    // 1. Fetch last 20 readings
    const { data: readings, error } = await supabase
      .from('blood_sugar_reading')
      .select('*')
      .eq('patient_id', patientId)
      .order('timestamp', { ascending: false })
      .limit(20);

    if (error) throw error;

    // 2. Algorithm: Detect Triggers
    const abnormalReadings = readings.filter(r => r.category === 'Abnormal');
    const triggerMap = {};

    abnormalReadings.forEach(r => {
      if (r.food_intake) {
        const foods = r.food_intake.toLowerCase().split(' ');
        foods.forEach(f => {
          if (f.length > 3) triggerMap[f] = (triggerMap[f] || 0) + 1;
        });
      }
    });

    // 3. Generate Recommendation
    let advice = "Keep monitoring your levels.";
    const topTrigger = Object.keys(triggerMap).reduce((a, b) => triggerMap[a] > triggerMap[b] ? a : b, null);

    if (topTrigger && triggerMap[topTrigger] > 1) {
      advice = `AI Alert: High blood sugar frequently observed after consuming '${topTrigger}'. Consider reducing intake.`;
      
      // Save to Database
      await supabase.from('recommendations').insert({
        patient_id: patientId,
        advice: advice,
        source: 'AI'
      });
    }

    res.json({ success: true, advice });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI Analysis Failed' });
  }
};