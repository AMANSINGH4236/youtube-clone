import { body, validationResult } from "express-validator";

// -----------------------------------------------------------------
// Validation chains (to be used in routes)
// -----------------------------------------------------------------

export const validateRegister = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

export const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// -----------------------------------------------------------------
// Middleware to check validation results (reusable)
// -----------------------------------------------------------------
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors as array of { path, msg }
    const formattedErrors = errors.array().map((err) => ({
      path: err.path,
      msg: err.msg,
    }));
    return res.status(400).json({ errors: formattedErrors });
  }
  next();
};