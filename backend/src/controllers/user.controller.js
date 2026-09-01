import User from "../models/User.model.js";
import Video from "../models/Video.model.js";
import Channel from "../models/Channel.model.js";

// -----------------------------------------------------------------
// @desc    Get watch history (populated videos + channels)
// @route   GET /api/users/me/history
// @access  Private
// -----------------------------------------------------------------
export const getHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "watchHistory.video",
        populate: { path: "channel", select: "channelName avatar" },
      })
      .lean();

    // Filter out nulls (deleted videos)
    const history = user.watchHistory
      .filter((entry) => entry.video !== null)
      .map((entry) => ({
        ...entry.video,
        watchedAt: entry.watchedAt,
      }));

    res.json(history);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Log/refresh watch (dedupe, move to top, cap at 200)
// @route   POST /api/users/me/history/:videoId
// @access  Private
// -----------------------------------------------------------------
export const addHistory = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Verify video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const user = await User.findById(userId);

    // Remove existing entry for this video (if any)
    user.watchHistory = user.watchHistory.filter(
      (entry) => entry.video.toString() !== videoId
    );

    // Add to front (most recent)
    user.watchHistory.unshift({ video: videoId, watchedAt: new Date() });

    // Cap at 200
    if (user.watchHistory.length > 200) {
      user.watchHistory = user.watchHistory.slice(0, 200);
    }

    await user.save();

    res.status(200).json({ message: "History updated" });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Remove a single entry from history
// @route   DELETE /api/users/me/history/:videoId
// @access  Private
// -----------------------------------------------------------------
export const removeHistory = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    user.watchHistory = user.watchHistory.filter(
      (entry) => entry.video.toString() !== videoId
    );
    await user.save();

    res.json({ message: "History entry removed" });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Clear all history
// @route   DELETE /api/users/me/history
// @access  Private
// -----------------------------------------------------------------
export const clearHistory = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { watchHistory: [] });
    res.json({ message: "History cleared" });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Get watch later list (populated)
// @route   GET /api/users/me/watch-later
// @access  Private
// -----------------------------------------------------------------
export const getWatchLater = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "watchLater",
        populate: { path: "channel", select: "channelName avatar" },
      })
      .lean();

    // Filter out deleted videos
    const watchLater = user.watchLater.filter((v) => v !== null);
    res.json(watchLater);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Toggle video in watch later
// @route   POST /api/users/me/watch-later/:videoId
// @access  Private
// -----------------------------------------------------------------
export const toggleWatchLater = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const user = await User.findById(userId);
    const index = user.watchLater.indexOf(videoId);

    if (index > -1) {
      user.watchLater.splice(index, 1);
      await user.save();
      return res.json({ message: "Removed from watch later", saved: false });
    } else {
      user.watchLater.push(videoId);
      await user.save();
      return res.json({ message: "Added to watch later", saved: true });
    }
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Get downloads list (populated)
// @route   GET /api/users/me/downloads
// @access  Private
// -----------------------------------------------------------------
export const getDownloads = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "downloads",
        populate: { path: "channel", select: "channelName avatar" },
      })
      .lean();

    const downloads = user.downloads.filter((v) => v !== null);
    res.json(downloads);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Toggle video in downloads
// @route   POST /api/users/me/downloads/:videoId
// @access  Private
// -----------------------------------------------------------------
export const toggleDownload = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const user = await User.findById(userId);
    const index = user.downloads.indexOf(videoId);

    if (index > -1) {
      user.downloads.splice(index, 1);
      await user.save();
      return res.json({ message: "Removed from downloads", downloaded: false });
    } else {
      user.downloads.push(videoId);
      await user.save();
      return res.json({ message: "Added to downloads", downloaded: true });
    }
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Get videos liked by the user
// @route   GET /api/users/me/liked-videos
// @access  Private
// -----------------------------------------------------------------
export const getLikedVideos = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const videos = await Video.find({ likes: userId })
      .populate("channel", "channelName avatar")
      .populate("uploader", "username avatar")
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Get videos uploaded by the user
// @route   GET /api/users/me/videos
// @access  Private
// -----------------------------------------------------------------
export const getYourVideos = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const videos = await Video.find({ uploader: userId })
      .populate("channel", "channelName avatar")
      .populate("uploader", "username avatar")
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Get videos from subscribed channels (feed)
// @route   GET /api/users/me/subscriptions
// @access  Private
// -----------------------------------------------------------------
export const getSubscriptionsFeed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "subscribedChannels"
    );
    const channelIds = user.subscribedChannels.map((c) => c._id);

    const videos = await Video.find({ channel: { $in: channelIds } })
      .populate("channel", "channelName avatar")
      .populate("uploader", "username avatar")
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Get video status for SaveMenu (watch later, downloads, playlists)
// @route   GET /api/users/me/video-status/:videoId
// @access  Private
// -----------------------------------------------------------------
export const getVideoStatus = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const playlists = await import("../models/Playlist.model.js").then(
      (m) => m.default
    );

    const inWatchLater = user.watchLater.some(
      (id) => id.toString() === videoId
    );
    const inDownloads = user.downloads.some((id) => id.toString() === videoId);

    // Find playlists that contain this video
    const userPlaylists = await playlists.find({
      owner: userId,
      videos: videoId,
    });
    const playlistIds = userPlaylists.map((p) => p._id);

    res.json({
      inWatchLater,
      inDownloads,
      playlistIds,
    });
  } catch (error) {
    next(error);
  }
};