import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import { prisma } from "./lib/prisma";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// เริ่มทำงาน Server
app.listen(PORT, () => {
  console.log(`🚀 CineHub Backend running on http://localhost:${PORT}`);
});
