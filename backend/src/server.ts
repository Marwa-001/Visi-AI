// ------------------------------
// 🌐 VisiAI Backend Server
// ------------------------------

// Import core modules
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import routes (use .js extension for ESM)
import scanRoutes from "./routes/scan.js";
import resultsRoutes from './routes/results.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// ------------------------------
// 🧩 Middleware
// ------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------
// 🗄️ MongoDB Connection
// ------------------------------
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/visiai';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// ------------------------------
// 🚏 API Routes
// ------------------------------
app.use('/api/scan', scanRoutes);
app.use('/api/results', resultsRoutes);

// ------------------------------
// 💓 Health Check Route
// ------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'VisiAI API is running smoothly 🚀',
  });
});

// ------------------------------
// ⚠️ Global Error Handler
// ------------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// ------------------------------
// 🚀 Start Server
// ------------------------------
app.listen(PORT, () => {
  console.log(`⚡ Server running on http://localhost:${PORT}`);
});




// // server.ts
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// // ✅ Type imports only
// import type { Express, Request, Response } from 'express';

// // Routers (CommonJS)
// const scanRoutes = require('./routes/scan');
// const resultsRoutes = require('./routes/results');

// dotenv.config();

// const app: Express = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // MongoDB connection
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/visiai';

// mongoose
//   .connect(MONGODB_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch((err: Error) => console.error('❌ MongoDB Connection Error:', err));

// // Routes
// app.use('/api/scan', scanRoutes);
// app.use('/api/results', resultsRoutes);

// // Health check
// app.get('/api/health', (req: Request, res: Response) => {
//   res.json({ status: 'ok', message: 'VisiAI API is running' });
// });

// // Error handler
// app.use((err: any, req: Request, res: Response, next: any) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!', message: err.message });
// });

// // Start server
// app.listen(PORT, () => console.log(`🚀 VisiAI Server running on port ${PORT}`));
