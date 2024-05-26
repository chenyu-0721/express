// models/users.js
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "請輸入您的名字"],
  },
  sex: {
    type: String,
    enum: ["male", "female"],
  },
  email: {
    type: String,
    required: [true, "請輸入您的 Email"],
    unique: true,
    lowercase: true,
    select: false,
  },
  photo: String,
  password: {
    type: String,
    required: [true, "請輸入密碼"],
    minlength: 8,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  followers: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: "user" },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  following: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: "user" },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  likedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    },
  ],
});

const User = mongoose.model("user", userSchema);

module.exports = User;
