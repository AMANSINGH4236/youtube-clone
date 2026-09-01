import express from "express";
import {
  createChannel,
  getChannelById,
  updateChannel,
  toggleSubscribe,
} from "../controllers/channel.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/:id", getChannelById);

// Private routes (all require authentication)
router.use(protect); // All routes below this will require auth
router.post("/", createChannel);
router.put("/:id", updateChannel);
router.post("/:id/subscribe", toggleSubscribe);

export default router;