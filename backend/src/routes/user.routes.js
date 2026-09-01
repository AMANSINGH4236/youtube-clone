import express from "express";
import {
  getHistory,
  addHistory,
  removeHistory,
  clearHistory,
  getWatchLater,
  toggleWatchLater,
  getDownloads,
  toggleDownload,
  getLikedVideos,
  getYourVideos,
  getSubscriptionsFeed,
  getVideoStatus,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// History
router.get("/me/history", getHistory);
router.post("/me/history/:videoId", addHistory);
router.delete("/me/history/:videoId", removeHistory);
router.delete("/me/history", clearHistory);

// Watch Later
router.get("/me/watch-later", getWatchLater);
router.post("/me/watch-later/:videoId", toggleWatchLater);

// Downloads
router.get("/me/downloads", getDownloads);
router.post("/me/downloads/:videoId", toggleDownload);

// Liked Videos
router.get("/me/liked-videos", getLikedVideos);

// Your Videos
router.get("/me/videos", getYourVideos);

// Subscriptions Feed
router.get("/me/subscriptions", getSubscriptionsFeed);

// Video Status (for SaveMenu)
router.get("/me/video-status/:videoId", getVideoStatus);

export default router;