exports.updateThreshold = async (req, res) => {
    const { category, min, max, staffId } = req.body;
    const supabase = req.app.locals.supabase;
  
    try {
      const { error } = await supabase
        .from('category_threshold')
        .update({ min_value: min, max_value: max, created_by: staffId, last_update: new Date() })
        .eq('name', category);
  
      if (error) throw error;
      res.json({ success: true, message: `Updated ${category} range` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.getThresholds = async (req, res) => {
    const supabase = req.app.locals.supabase;
    try {
      const { data, error } = await supabase.from('category_threshold').select('*').order('category_id', { ascending: true });
      if (error) throw error;
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };