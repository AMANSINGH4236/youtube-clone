import Playlist from "../models/Playlist.model.js";
import Video from "../models/Video.model.js";

// -----------------------------------------------------------------
// @desc    Get all playlists owned by the current user
// @route   GET /api/playlists
// @access  Private
// -----------------------------------------------------------------
export const getMyPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate("videos", "title thumbnailUrl")
      .sort({ createdAt: -1 });

    res.json(playlists);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
// -----------------------------------------------------------------
export const createPlaylist = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Playlist name is required" });
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      owner: req.user._id,
      videos: [],
    });

    res.status(201).json({
      message: "Playlist created successfully",
      playlist,
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Get a single playlist by ID (with videos populated)
// @route   GET /api/playlists/:id
// @access  Private
// -----------------------------------------------------------------
export const getPlaylistById = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate({
        path: "videos",
        populate: { path: "channel", select: "channelName avatar" },
      })
      .populate("owner", "username avatar");

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check ownership – only owner can view
    if (playlist.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this playlist" });
    }

    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Rename a playlist (owner only)
// @route   PUT /api/playlists/:id
// @access  Private (owner)
// -----------------------------------------------------------------
export const renamePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to rename this playlist" });
    }

    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Playlist name is required" });
    }

    playlist.name = name.trim();
    await playlist.save();

    res.json({
      message: "Playlist renamed successfully",
      playlist,
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Delete a playlist (owner only)
// @route   DELETE /api/playlists/:id
// @access  Private (owner)
// -----------------------------------------------------------------
export const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this playlist" });
    }

    await playlist.deleteOne();
    res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Add a video to a playlist (owner only)
// @route   POST /api/playlists/:id/videos/:videoId
// @access  Private (owner)
// -----------------------------------------------------------------
export const addVideoToPlaylist = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this playlist" });
    }

    // Verify video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if already in playlist
    if (playlist.videos.includes(videoId)) {
      return res.status(400).json({ message: "Video already in playlist" });
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res.json({
      message: "Video added to playlist",
      playlist,
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Remove a video from a playlist (owner only)
// @route   DELETE /api/playlists/:id/videos/:videoId
// @access  Private (owner)
// -----------------------------------------------------------------
export const removeVideoFromPlaylist = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this playlist" });
    }

    const index = playlist.videos.indexOf(videoId);
    if (index === -1) {
      return res.status(400).json({ message: "Video not found in playlist" });
    }

    playlist.videos.splice(index, 1);
    await playlist.save();

    res.json({
      message: "Video removed from playlist",
      playlist,
    });
  } catch (error) {
    next(error);
  }
};