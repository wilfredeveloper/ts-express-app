// src/routes/authRoutes.ts
import express from 'express';
import { handleAuth } from '../controllers/authController';

const authRoutes = express.Router();

// Route to handle all /api/auth/* requests
authRoutes.all('/api/auth/*', handleAuth);

export default authRoutes;
