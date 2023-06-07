const mongoose = require("mongoose");
const ROLES = require("../references/role.reference");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      min: 6,
      max: 255,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      min: 8,
    },
    profileImage: {
      type: String,
      trim: true,
      default: "default.png",
    },
    following: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    followers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    sharedPosts: [
      {
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
        },
      },
    ],
    role: { type: String, enum: [ROLES.ADMIN, ROLES.USER], required: true },
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
