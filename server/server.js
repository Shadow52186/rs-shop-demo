require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParse = require('body-parser');
const connectDB = require('./Config/db');
const path = require("path");
const { readdirSync } = require('fs');

const app = express();

// ✅ Connect MongoDB
connectDB();

// ✅ Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParse.json({ limit: '10mb' }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Auto load all routes in /Routes (ยกเว้นคุณไม่อยากแยก)
readdirSync('./Routes').forEach((r) => {
  app.use('/api', require('./Routes/' + r));
});

// ✅ Start server
app.listen(5000, () => console.log('Server is Running 5000'));
