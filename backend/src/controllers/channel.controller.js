import Channel from "../models/Channel.model.js";
import User from "../models/User.model.js";
import Video from "../models/Video.model.js";

// -----------------------------------------------------------------
// @desc    Create a channel (one per user)
// @route   POST /api/channels
// @access  Private
// -----------------------------------------------------------------
export const createChannel = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { channelName, description, banner, avatar } = req.body;

    // Check if user already has a channel
    const existingChannel = await Channel.findOne({ owner: userId });
    if (existingChannel) {
      return res.status(409).json({
        message: "You already have a channel. Only one channel per user is allowed.",
      });
    }

    // Auto-generate unique @handle from channelName
    let baseHandle = "@" + channelName.replace(/\s+/g, "");
    let handle = baseHandle;
    let suffix = 1;
    while (await Channel.findOne({ handle })) {
      handle = `${baseHandle}${suffix}`;
      suffix++;
    }

    // Create channel
    const channel = await Channel.create({
      channelName,
      handle,
      owner: userId,
      description: description || "Welcome to my channel!",
      banner: banner || "https://via.placeholder.com/2560x400?text=Channel+Banner",
      avatar: avatar || "https://ui-avatars.com/api/?background=random&name=Channel",
      subscribers: 0,
      videos: [],
    });

    // Push channel ID to user's channels array
    await User.findByIdAndUpdate(userId, {
      $push: { channels: channel._id },
    });

    res.status(201).json({
      message: "Channel created successfully",
      channel,
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Get channel by ID (populates videos + owner)
// @route   GET /api/channels/:id
// @access  Public
// -----------------------------------------------------------------
export const getChannelById = async (req, res, next) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate("videos")
      .populate("owner", "username avatar");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.status(200).json({channel});
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Update channel details
// @route   PUT /api/channels/:id
// @access  Private (owner only)
// -----------------------------------------------------------------
export const updateChannel = async (req, res, next) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check ownership
    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this channel" });
    }

    const { channelName, description, banner, avatar } = req.body;

    // Update fields
    if (channelName) {
      channel.channelName = channelName;
      // Update handle if channelName changes
      let baseHandle = "@" + channelName.replace(/\s+/g, "");
      let newHandle = baseHandle;
      let suffix = 1;
      // Make sure new handle is unique (excluding current channel)
      while (await Channel.findOne({ handle: newHandle, _id: { $ne: channel._id } })) {
        newHandle = `${baseHandle}${suffix}`;
        suffix++;
      }
      channel.handle = newHandle;
    }
    if (description) channel.description = description;
    if (banner) channel.banner = banner;
    if (avatar) channel.avatar = avatar;

    await channel.save();

    res.status(200).json({
      message: "Channel updated successfully",
      channel,
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------
// @desc    Toggle subscribe/unsubscribe
// @route   POST /api/channels/:id/subscribe
// @access  Private
// -----------------------------------------------------------------
export const toggleSubscribe = async (req, res, next) => {
  try {
    const channelId = req.params.id;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Don't allow subscribing to your own channel
    if (channel.owner.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot subscribe to your own channel" });
    }

    const user = await User.findById(userId);

    // Check if already subscribed
    const isSubscribed = user.subscribedChannels.some(
      (id) => id.toString() === channelId
    );

    if (isSubscribed) {
      // Unsubscribe
      await User.findByIdAndUpdate(userId, {
        $pull: { subscribedChannels: channelId },
      });
      await Channel.findByIdAndUpdate(channelId, {
        $inc: { subscribers: -1 },
      });
    } else {
      // Subscribe
      await User.findByIdAndUpdate(userId, {
        $push: { subscribedChannels: channelId },
      });
      await Channel.findByIdAndUpdate(channelId, {
        $inc: { subscribers: 1 },
      });
    }

    // Get updated channel
    const updatedChannel = await Channel.findById(channelId);

    res.json({
      message: isSubscribed ? "Unsubscribed successfully" : "Subscribed successfully",
      subscribed: !isSubscribed,
      subscribers: updatedChannel.subscribers,
    });
  } catch (error) {
    next(error);
  }
};