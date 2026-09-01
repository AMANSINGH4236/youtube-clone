import express from "express";
import {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleLike,
  toggleDislike,
} from "../controllers/video.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getVideos);
router.get("/:id", getVideoById);

// All routes below require authentication
router.use(protect);

router.post("/", createVideo);
router.put("/:id", updateVideo);
router.delete("/:id", deleteVideo);
router.post("/:id/like", toggleLike);
router.post("/:id/dislike", toggleDislike);

export default router;