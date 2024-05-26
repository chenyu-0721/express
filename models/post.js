const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    content: {
      type: String,
      required: [true, "Content 未填寫"],
    },
    type: {
      type: String,
      enum: ["group", "person"],
    },
    tags: [
      {
        type: String,
        required: [true, "貼文標籤 tags 未填寫"],
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "user",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  { versionKey: false }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
