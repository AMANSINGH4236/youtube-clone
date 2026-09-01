// services/commentService.js
import api from "./api.js";

/**
 * Get all comments for a video (newest first)
 * @param {string} videoId - Video ID
 * @returns {Promise} - Array of comments (populated with user)
 */
export const getCommentsForVideo = (videoId) =>
  api.get(`/comments/video/${videoId}`);

/**
 * Add a comment to a video
 * @param {Object} payload - { video: string, text: string }
 * @returns {Promise} - { message, comment }
 */
export const addComment = (payload) => api.post("/comments", payload);

/**
 * Update a comment (owner only)
 * @param {string} id - Comment ID
 * @param {Object} payload - { text: string }
 * @returns {Promise} - { message, comment }
 */
export const updateComment = (id, payload) =>
  api.put(`/comments/${id}`, payload);

/**
 * Delete a comment (owner only)
 * @param {string} id - Comment ID
 * @returns {Promise} - { message }
 */
export const deleteComment = (id) => api.delete(`/comments/${id}`);