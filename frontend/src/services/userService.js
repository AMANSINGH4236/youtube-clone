// services/userService.js
import api from "./api.js";

// --- History ---

/**
 * Get watch history (populated videos + channels)
 */
export const getHistory = () => api.get("/users/me/history");

/**
 * Log/refresh watch history entry (dedupe, move to top, cap at 200)
 */
export const addHistory = (videoId) => api.post(`/users/me/history/${videoId}`);

/**
 * Remove a single entry from history
 */
export const removeHistoryEntry = (videoId) =>
  api.delete(`/users/me/history/${videoId}`);

/**
 * Clear all history
 */
export const clearHistory = () => api.delete("/users/me/history");

// --- Watch Later ---

/**
 * Get watch later list (populated)
 */
export const getWatchLater = () => api.get("/users/me/watch-later");

/**
 * Toggle video in watch later
 */
export const toggleWatchLater = (videoId) =>
  api.post(`/users/me/watch-later/${videoId}`);

// --- Downloads ---

/**
 * Get downloads list (populated)
 */
export const getDownloads = () => api.get("/users/me/downloads");

/**
 * Toggle video in downloads
 */
export const toggleDownload = (videoId) =>
  api.post(`/users/me/downloads/${videoId}`);

// --- User content ---

/**
 * Get videos liked by the user
 */
export const getLikedVideos = () => api.get("/users/me/liked-videos");

/**
 * Get videos uploaded by the user
 */
export const getYourVideos = () => api.get("/users/me/videos");

/**
 * Get videos from subscribed channels (feed)
 */
export const getSubscriptionsFeed = () => api.get("/users/me/subscriptions");

/**
 * Get video status for SaveMenu (watch later, downloads, playlists)
 */
export const getVideoSaveStatus = (videoId) =>
  api.get(`/users/me/video-status/${videoId}`);