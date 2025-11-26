require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const aiController = require('./controllers/aiController');
const adminController = require('./controllers/adminController');
const staffController = require('./controllers/staffController');

const app = express();
app.use(cors());
app.use(express.json());

// Supabase Setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
app.locals.supabase = supabase;

// --- ROUTES ---

// AI
app.post('/api/ai/analyze', aiController.analyzePattern);

// Admin
app.post('/api/admin/create-user', adminController.createUser);
app.post('/api/admin/update-user', adminController.updateUser); // NEW
app.get('/api/admin/users', adminController.getAllUsers);       // NEW
app.post('/api/reports/generate', adminController.generateReport);

// Staff
app.get('/api/staff/thresholds', staffController.getThresholds);
app.post('/api/staff/thresholds/update', staffController.updateThreshold);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));