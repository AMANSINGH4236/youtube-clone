import express from "express";
import {
  getMyPlaylists,
  createPlaylist,
  getPlaylistById,
  renamePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/", getMyPlaylists);
router.post("/", createPlaylist);
router.get("/:id", getPlaylistById);
router.put("/:id", renamePlaylist);
router.delete("/:id", deletePlaylist);
router.post("/:id/videos/:videoId", addVideoToPlaylist);
router.delete("/:id/videos/:videoId", removeVideoFromPlaylist);

export default router;