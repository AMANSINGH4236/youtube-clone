// services/playlistService.js
import api from "./api.js";

/**
 * Get all playlists owned by the current user
 * @returns {Promise} - Array of playlists
 */
export const getMyPlaylists = () => api.get("/playlists");

/**
 * Create a new playlist
 * @param {string} name - Playlist name
 * @returns {Promise} - { message, playlist }
 */
export const createPlaylist = (name) => api.post("/playlists", { name });

/**
 * Get a single playlist by ID (with videos populated)
 * @param {string} id - Playlist ID
 * @returns {Promise} - { playlist }
 */
export const getPlaylistById = (id) => api.get(`/playlists/${id}`);

/**
 * Rename a playlist (owner only)
 * @param {string} id - Playlist ID
 * @param {string} name - New playlist name
 * @returns {Promise} - { message, playlist }
 */
export const renamePlaylist = (id, name) =>
  api.put(`/playlists/${id}`, { name });

/**
 * Delete a playlist (owner only)
 * @param {string} id - Playlist ID
 * @returns {Promise} - { message }
 */
export const deletePlaylist = (id) => api.delete(`/playlists/${id}`);

/**
 * Add a video to a playlist (owner only)
 * @param {string} id - Playlist ID
 * @param {string} videoId - Video ID
 * @returns {Promise} - { message, playlist }
 */
export const addVideoToPlaylist = (id, videoId) =>
  api.post(`/playlists/${id}/videos/${videoId}`);

/**
 * Remove a video from a playlist (owner only)
 * @param {string} id - Playlist ID
 * @param {string} videoId - Video ID
 * @returns {Promise} - { message, playlist }
 */
export const removeVideoFromPlaylist = (id, videoId) =>
  api.delete(`/playlists/${id}/videos/${videoId}`);