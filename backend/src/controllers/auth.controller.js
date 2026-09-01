import User from "../models/User.model.js";
import { generateToken } from "../utils/generateToken.js";

// -----------------------------------------------------------------
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// -----------------------------------------------------------------
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check for duplicate email or username (409 Conflict)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with that email or username already exists",
      });
    }

    // Create user
    const user = await User.create({ username, email, password });

    // ❌ No token – user must go to login page
    res.status(201).json({
      message: "User registered successfully. Please log in.",
      user, // Password removed by toJSON transform
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// -----------------------------------------------------------------
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email and populate subscribedChannels
    const user = await User.findOne({ email }).populate("subscribedChannels");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token (only on login)
    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user, // Password removed by toJSON transform
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Get current user (rehydrate session)
// @route   GET /api/auth/me
// @access  Private
// -----------------------------------------------------------------
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("subscribedChannels");
    res.json(user);
  } catch (error) {
    next(error);
  }
};