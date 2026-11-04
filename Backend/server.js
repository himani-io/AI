import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";

import { GoogleGenAI } from "@google/genai";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.use("/api", chatRoutes);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected with Database");
  } catch (err) {
    console.log("Failed to connect to DB", err);
  }
};

connectDB();
