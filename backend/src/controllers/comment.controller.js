import Comment from "../models/Comment.model.js";
import Video from "../models/Video.model.js";

// -----------------------------------------------------------------
// @desc    Get all comments for a video (newest first)
// @route   GET /api/comments/video/:videoId
// @access  Public
// -----------------------------------------------------------------
export const getCommentsForVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    // Verify video exists (optional but cleaner)
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const comments = await Comment.find({ video: videoId })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar");

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Add a comment to a video
// @route   POST /api/comments
// @access  Private
// -----------------------------------------------------------------
export const addComment = async (req, res, next) => {
  try {
    const { video, text } = req.body;
    const userId = req.user._id;

    // Verify video exists
    const videoDoc = await Video.findById(video);
    if (!videoDoc) {
      return res.status(404).json({ message: "Video not found" });
    }

    const comment = await Comment.create({
      video,
      user: userId,
      text,
    });

    // Populate user info before returning
    await comment.populate("user", "username avatar");

    res.status(201).json({
      message: "Comment added",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Update a comment (owner only)
// @route   PUT /api/comments/:id
// @access  Private (owner)
// -----------------------------------------------------------------
export const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Owner check
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    comment.text = text;
    await comment.save();

    // Repopulate user info
    await comment.populate("user", "username avatar");

    res.json({
      message: "Comment updated",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Delete a comment (owner only)
// @route   DELETE /api/comments/:id
// @access  Private (owner)
// -----------------------------------------------------------------
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Owner check
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};