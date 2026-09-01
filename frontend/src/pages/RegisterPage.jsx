// client/src/pages/RegisterPage.jsx
// Rubric: User Authentication (40 marks) — registration with validation,
// inline error messages per field, redirect to /login on success.
// TICKET-FE-02

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { validateEmail, validatePassword, validateUsername } from "../utils/validators.js";
import toast from "react-hot-toast";

// ── SVG Icons ──────────────────────────────────────────────
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
    <line x1="21" y1="3" x2="3" y2="21" />
  </svg>
);

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fields, setFields] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!validateUsername(fields.username))
      errs.username = "Username must be at least 3 characters";
    if (!validateEmail(fields.email))
      errs.email = "Enter a valid email address";
    if (!validatePassword(fields.password))
      errs.password = "Password must be at least 6 characters";
    if (fields.password !== fields.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await register(fields.username, fields.email, fields.password);
      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        serverErrors.forEach(({ path, msg }) => {
          if (path) mapped[path] = msg;
        });
        if (Object.keys(mapped).length) {
          setErrors(mapped);
        } else {
          setApiError(serverErrors[0]?.msg || "Registration failed.");
        }
      } else {
        setApiError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg height="20" viewBox="0 0 30 20" focusable="false">
            <g>
              <path
                d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"
                fill="#FF0000"
              />
              <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white" />
            </g>
          </svg>
          <span className="auth-logo-text">YouTube</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">to continue to YouTube</p>

        {apiError && <div className="auth-api-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={fields.username}
              onChange={handleChange}
              className={errors.username ? "input-error" : ""}
              placeholder="Choose a username"
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              placeholder="Enter your email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={fields.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex="-1"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={fields.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleConfirmPassword}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;