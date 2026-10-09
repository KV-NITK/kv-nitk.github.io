import dns from "node:dns";

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import teamRoutes from "./routes/team.routes.js";
import { supabase } from "./config/supabase.js";
import authRoutes from "./routes/auth.routes.js";
import gameRoutes from "./routes/game.routes.js";
import cookieParser from "cookie-parser";
import scanRoutes from "./routes/scan.routes.js";
import coordinatorRoutes from "./routes/coordinator.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import paymentWebhookRoutes from "./routes/payment.webhook.routes.js";
import passRoutes from "./routes/pass.routes.js";
import { listProductsController } from "./controllers/payment.controller.js";
import adminRoutes from "./routes/admin.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

import { getAllowedOrigins } from "./config/urls.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== "production" &&
          (origin.startsWith("http://localhost:") ||
            origin.startsWith("http://127.0.0.1:") ||
            origin.includes("kannadavedike.dev.local")))
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);


app.use(
  "/api/payments/webhook/cashfree",
  paymentWebhookRoutes
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
app.use("/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/coordinator", coordinatorRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/payments", paymentRoutes);
app.get("/api/products", listProductsController);
app.use("/api/passes", passRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

// Serve frontend static build if present in container / root
const clientBuildPath = path.join(__dirname, "../../build");
app.use(express.static(clientBuildPath));

// Fallback to React static build for non-API requests
app.use((req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/auth/")) return next();
  res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
    if (err) next();
  });
});

export default app;
