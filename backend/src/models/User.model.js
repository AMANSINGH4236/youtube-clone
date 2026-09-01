import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── Password validator ──────────────────────────────────────
const validatePassword = (password) => {
  // At least 6 characters
  if (password.length < 6) return false;
  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  // At least one number
  if (!/[0-9]/.test(password)) return false;
  // At least one special character (non‑alphanumeric)
  if (!/[^a-zA-Z0-9]/.test(password)) return false;
  return true;
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: validatePassword,
        message:
          "Password must be at least 6 characters long, contain one uppercase letter, one number, and one special character.",
      },
    },
    avatar: {
      type: String,
      default: "https://ui-avatars.com/api/?background=random&name=User",
    },
    channels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
    watchHistory: {
      type: [
        {
          video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
          watchedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    watchLater: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    downloads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    subscribedChannels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
  },
  { timestamps: true }
);

// ── Pre‑save hook – hash password only if modified ──
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance method – compare plain password with hashed ──
userSchema.methods.comparePassword = async function (candidate) {
  return await bcrypt.compare(candidate, this.password);
};

// ── Transform – remove password from JSON responses ──
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;