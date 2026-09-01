import express from "express";
import {
  register,
  login,
  getMe,
} from "../controllers/auth.controller.js";
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from "../validators/auth.validator.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, handleValidationErrors, register);
router.post("/login", validateLogin, handleValidationErrors, login);

// Private route
router.get("/me", protect, getMe);

export default router;