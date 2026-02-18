import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import moviesRoutes from "./routes/movies.routes.js";
import ratingRoutes from "./routes/ratings.routes.js";
import { requireDatabase } from "./middlewares/db.middleware.js";
import { isDatabaseReady } from "./config/db.js";

dotenv.config();

const allowedOrigin = process.env.ALLOWED_ORIGIN;
const allowedOrigins = (allowedOrigin || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.use(
  cors({
    origin:
      allowedOrigins.length === 0
        ? true
        : (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
              return;
            }
            callback(new Error("Not allowed by CORS"));
          },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", requireDatabase, authRoutes);
app.use("/api/user", requireDatabase, userRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/ratings", requireDatabase, ratingRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Flick Deck API!");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    database: isDatabaseReady() ? "connected" : "disconnected",
  });
});

export default app;
