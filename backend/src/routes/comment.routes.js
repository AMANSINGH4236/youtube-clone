import express from "express";
import {
  getCommentsForVideo,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public – get comments for a video
router.get("/video/:videoId", getCommentsForVideo);

// All routes below require authentication
router.use(protect);

router.post("/", addComment);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;