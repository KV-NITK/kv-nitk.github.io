import express from "express";
import cors from "cors";
import helmet from "helmet";
import teamRoutes from "./routes/team.routes.js";
import { supabase } from "./config/supabase.js";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://kannadavedike.dev.local:5173",
  "https://kannadavedike.dev.local:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});


app.use("/api/teams", teamRoutes);
app.use("/api/auth", authRoutes);


export default app;
