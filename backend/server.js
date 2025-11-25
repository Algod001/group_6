require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import Modular Routes
const aiRoutes = require('../routes/aiRoutes');
// const reportRoutes = require('./routes/reportRoutes'); // We will add this later

// Use Routes
app.use('/api/ai', aiRoutes);
// app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5001; // Using 5001 to avoid conflicts
app.listen(PORT, () => console.log(`Backend Brain running on port ${PORT}`));