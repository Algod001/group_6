const supabase = require('@supabase/supabase-js').createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.assignPatient = async (req, res) => {
    const { patientId, specialistId, staffId } = req.body;
    try {
        // Upsert: If assignment exists, update it. If not, insert.
        const { error } = await supabase
            .from('patient_specialist_assignment')
            .upsert({ 
                patient_id: patientId, 
                specialist_id: specialistId, 
                assigned_by: staffId,
                assigned_date: new Date()
            }, { onConflict: 'patient_id, specialist_id' });

        if (error) throw error;
        res.json({ success: true, message: "Assignment successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Fetch data for Dropdowns
exports.getDataForAssignment = async (req, res) => {
    try {
        // Get all patients
        const { data: patients } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'patient');
        // Get all specialists
        const { data: specialists } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'specialist');
        
        res.json({ success: true, patients, specialists });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ... keep getThresholds and updateThreshold from before ...
exports.getThresholds = async (req, res) => {
    const { data, error } = await supabase.from('category_threshold').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data });
};

exports.updateThreshold = async (req, res) => {
    const { category, min, max, staffId } = req.body;
    const { error } = await supabase
        .from('category_threshold')
        .update({ min_value: min, max_value: max, created_by: staffId, last_update: new Date() })
        .eq('name', category);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
};