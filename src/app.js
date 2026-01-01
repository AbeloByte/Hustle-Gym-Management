const express = require('express');
const cors = require('cors');
const memberRoutes = require('./routes/memberRoutes');
const planRoutes = require('./routes/planRoutes'); // 1. Must be imported
const membershipRoutes = require('./routes/membershipRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/members', memberRoutes);
app.use('/api/plans', planRoutes);           // 2. Must be registered here
app.use('/api/memberships', membershipRoutes);

app.get('/', (req, res) => res.send('Gym System API is running...'));

module.exports = app;
