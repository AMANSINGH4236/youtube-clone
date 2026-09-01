// services/channelService.js
import api from "./api.js";

/**
 * Create a new channel (one per user)
 * @param {Object} payload - { channelName, description?, banner?, avatar? }
 * @returns {Promise} - { message, channel }
 */
export const createChannel = (payload) => api.post("/channels", payload);

/**
 * Get channel by ID (populates videos + owner)
 * @param {string} id - Channel ID
 * @returns {Promise} - { channel }
 */
export const getChannelById = (id) => api.get(`/channels/${id}`);

/**
 * Update channel (owner only)
 * @param {string} id - Channel ID
 * @param {Object} payload - { channelName?, description?, banner?, avatar? }
 * @returns {Promise} - { message, channel }
 */
export const updateChannel = (id, payload) => api.put(`/channels/${id}`, payload);

/**
 * Toggle subscribe/unsubscribe
 * @param {string} id - Channel ID
 * @returns {Promise} - { message, subscribed, subscribers }
 */
export const toggleSubscribe = (id) => api.post(`/channels/${id}/subscribe`);