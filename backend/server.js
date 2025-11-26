require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Controllers
const aiController = require('./controllers/aiController');
const adminController = require('./controllers/adminController');
const staffController = require('./controllers/staffController');

// --- ROUTES ---

// 1. Patient/AI Routes
app.post('/api/ai/analyze', aiController.analyzePattern);

// 2. Admin Routes
app.post('/api/reports/generate', adminController.generateReport);
app.post('/api/admin/create-user', adminController.createUser);
app.post('/api/admin/update-user', adminController.updateUser);

// 3. Staff Routes
app.get('/api/staff/thresholds', staffController.getThresholds);
app.post('/api/staff/thresholds/update', staffController.updateThreshold);
app.get('/api/staff/assignment-data', staffController.getDataForAssignment); // For Dropdowns
app.post('/api/staff/assign-patient', staffController.assignPatient);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));