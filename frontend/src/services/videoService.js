// services/videoService.js
import api from "./api.js";

/**
 * Get all videos with optional filters
 * @param {Object} params - { search?, category?, isShort? }
 * @returns {Promise} - Array of videos (populated with channel + uploader)
 */
export const getVideos = (params) => api.get("/videos", { params });

/**
 * Get a single video by ID (auto-increments views)
 * @param {string} id - Video ID
 * @returns {Promise} - Video object (populated with channel + uploader)
 */
export const getVideoById = (id) => api.get(`/videos/${id}`);

/**
 * Create a new video (requires a channel)
 * @param {Object} payload - { title, description?, thumbnailUrl, videoUrl, category, isShort? }
 * @returns {Promise} - { message, video }
 */
export const createVideo = (payload) => api.post("/videos", payload);

/**
 * Update a video (owner only)
 * @param {string} id - Video ID
 * @param {Object} payload - { title?, description?, thumbnailUrl?, videoUrl?, category?, isShort? }
 * @returns {Promise} - { message, video }
 */
export const updateVideo = (id, payload) => api.put(`/videos/${id}`, payload);

/**
 * Delete a video (owner only)
 * @param {string} id - Video ID
 * @returns {Promise} - { message }
 */
export const deleteVideo = (id) => api.delete(`/videos/${id}`);

/**
 * Toggle like on a video
 * @param {string} id - Video ID
 * @returns {Promise} - { likesCount, dislikesCount, userHasLiked }
 */
export const likeVideo = (id) => api.post(`/videos/${id}/like`);

/**
 * Toggle dislike on a video
 * @param {string} id - Video ID
 * @returns {Promise} - { likesCount, dislikesCount, userHasDisliked }
 */
export const dislikeVideo = (id) => api.post(`/videos/${id}/dislike`);