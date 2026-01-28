const express = require('express');
const app = express();

app.use(express.json());


// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

app.use(require('./middlewares/error.middleware'));

module.exports = app;
