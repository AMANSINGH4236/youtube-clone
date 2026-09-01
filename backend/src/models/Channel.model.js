import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    channelName: {
      type: String,
      required: true,
      trim: true,
    },
    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      default: "Welcome to my channel!",
    },
    banner: {
      type: String,
      default: "https://via.placeholder.com/2560x400?text=Channel+Banner",
    },
    avatar: {
      type: String,
      default: "https://ui-avatars.com/api/?background=random&name=Channel",
    },
    subscribers: {
      type: Number,
      default: 0,
    },
    // ✅ Added this field – keeps channel.videos in sync with video create/delete
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

const Channel = mongoose.model("Channel", channelSchema);
export default Channel;