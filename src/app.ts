// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";

require('dotenv').config();
const app = express();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/homeseek";

const allowedOrigins = ["http://localhost:3000"];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
}

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB");

    // Middleware
    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // app.use(RBACMiddleware);

    // Routes
    app.use(userRoutes);

    app.get("/", (req, res) => {
      res.send("Hello World");
    });

    // Start server
    const PORT = process.env.SERVER_PORT || 5678;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();
