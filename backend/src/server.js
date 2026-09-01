// Load environment variables FIRST
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") }); // loads from backend/.env

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

// Middleware (these files don’t exist yet – we’ll create them next)
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes (will be added one by one)
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/playlists", playlistRoutes);

// Error handling (must be LAST)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5050;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});