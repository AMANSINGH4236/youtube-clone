// services/authService.js
// TICKET-FE-01

import api from "./api.js";

/**
 * Register a new user
 * @param {Object} payload - { username, email, password }
 * @returns {Promise} - { message, user }
 */
export const registerUser = (payload) => api.post("/auth/register", payload);

/**
 * Log in an existing user
 * @param {Object} payload - { email, password }
 * @returns {Promise} - { message, token, user }
 */
export const loginUser = (payload) => api.post("/auth/login", payload);

/**
 * Get the current authenticated user (rehydrate session)
 * @returns {Promise} - { user }
 */
export const getMe = () => api.get("/auth/me");