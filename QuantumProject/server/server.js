require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI);


app.use('/api', authRoutes);


app.use((err, req, res, next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
