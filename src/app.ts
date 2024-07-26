// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { Resend } from "resend";
import userRoutes from "./routes/userRoutes";

require("dotenv").config();
const app = express();

const MONGODB_URI = process.env.MONGODB_URI!;

const allowedOrigins = ["http://localhost:3000"];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

const RESENDAPIKEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESENDAPIKEY);

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Middleware
    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // app.use(RBACMiddleware);

    // Routes
    app.use(userRoutes);

    app.get("/", async (req, res) => {
      const { data, error } = await resend.emails.send({
        from: "admin@wilfredeveloper.me",
        to: "pxumtech@gmail.com",
        subject: "Hello Homeseek",
        html: "<strong>It works now!!</strong>",
      });

      if(error) {
        return res.status(400).json({
          message: "Could not send email",
          error
        })
      }

      res.status(200).json({ data })
    });

    // Start server
    const PORT = process.env.SERVER_PORT;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();
