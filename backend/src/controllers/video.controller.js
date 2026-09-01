import Video, { CATEGORIES } from "../models/Video.model.js";
import Channel from "../models/Channel.model.js";

// Helper: escape regex special chars (prevents ReDoS attacks)
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// -----------------------------------------------------------------
// @desc    Get all videos (filter by search, category, isShort)
// @route   GET /api/videos
// @access  Public
// -----------------------------------------------------------------
export const getVideos = async (req, res, next) => {
  try {
    const { search, category, isShort } = req.query;
    const filter = {};

    if (search) {
      filter.title = { $regex: escapeRegex(search), $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (isShort !== undefined) {
      filter.isShort = isShort === "true";
    }

    const videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .populate("channel", "channelName avatar")
      .populate("uploader", "username avatar");

    res.json(videos);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Get a single video by ID (increments view count)
// @route   GET /api/videos/:id
// @access  Public
// -----------------------------------------------------------------
export const getVideoById = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate("channel", "channelName avatar owner")
      .populate("uploader", "username avatar");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Increment views atomically
    await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Re-fetch with updated views
    const updatedVideo = await Video.findById(req.params.id)
      .populate("channel", "channelName avatar owner")
      .populate("uploader", "username avatar");

    res.json(updatedVideo);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Create a new video (requires a channel)
// @route   POST /api/videos
// @access  Private
// -----------------------------------------------------------------
export const createVideo = async (req, res, next) => {
  try {
    const { title, description, thumbnailUrl, videoUrl, category, isShort } = req.body;
    const userId = req.user._id;

    // --- Explicit validation ---
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!thumbnailUrl) missingFields.push("thumbnailUrl");
    if (!videoUrl) missingFields.push("videoUrl");
    if (!category) missingFields.push("category");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Optional: trim title and description
    const trimmedTitle = title.trim();
    const trimmedDescription = description ? description.trim() : "";

    // Find the user's channel
    const channel = await Channel.findOne({ owner: userId });
    if (!channel) {
      return res.status(400).json({ message: "You must create a channel first" });
    }

    // Validate category
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Choose from: ${CATEGORIES.join(", ")}`,
      });
    }

    const video = await Video.create({
      title: trimmedTitle,
      description: trimmedDescription,
      thumbnailUrl,
      videoUrl,
      category,
      channel: channel._id,
      uploader: userId,
      isShort: isShort || false,
    });

    // Push video reference to channel's videos array
    await Channel.findByIdAndUpdate(channel._id, {
      $push: { videos: video._id },
    });

    res.status(201).json({
      message: "Video uploaded successfully",
      video,
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Update a video (owner only)
// @route   PUT /api/videos/:id
// @access  Private (owner)
// -----------------------------------------------------------------
export const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Owner check
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this video" });
    }

    const { title, description, thumbnailUrl, videoUrl, category, isShort } = req.body;

    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Choose from: ${CATEGORIES.join(", ")}`,
      });
    }

    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (thumbnailUrl) video.thumbnailUrl = thumbnailUrl;
    if (videoUrl) video.videoUrl = videoUrl;
    if (category) video.category = category;
    if (isShort !== undefined) video.isShort = isShort;

    await video.save();
    res.json({ message: "Video updated successfully", video });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Delete a video (owner only)
// @route   DELETE /api/videos/:id
// @access  Private (owner)
// -----------------------------------------------------------------
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this video" });
    }

    // Remove video reference from channel's videos array
    await Channel.findByIdAndUpdate(video.channel, {
      $pull: { videos: video._id },
    });

    await video.deleteOne();
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Toggle like on a video
// @route   POST /api/videos/:id/like
// @access  Private
// -----------------------------------------------------------------
export const toggleLike = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const userId = req.user._id;
    const alreadyLiked = video.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      video.likes = video.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      video.likes.push(userId);
      // Remove from dislikes if present
      video.dislikes = video.dislikes.filter((id) => id.toString() !== userId.toString());
    }

    await video.save();
    res.json({
      likesCount: video.likes.length,
      dislikesCount: video.dislikes.length,
      userHasLiked: !alreadyLiked,
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Toggle dislike on a video
// @route   POST /api/videos/:id/dislike
// @access  Private
// -----------------------------------------------------------------
export const toggleDislike = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const userId = req.user._id;
    const alreadyDisliked = video.dislikes.some((id) => id.toString() === userId.toString());

    if (alreadyDisliked) {
      video.dislikes = video.dislikes.filter((id) => id.toString() !== userId.toString());
    } else {
      video.dislikes.push(userId);
      video.likes = video.likes.filter((id) => id.toString() !== userId.toString());
    }

    await video.save();
    res.json({
      likesCount: video.likes.length,
      dislikesCount: video.dislikes.length,
      userHasDisliked: !alreadyDisliked,
    });
  } catch (error) {
    next(error);
  }
};