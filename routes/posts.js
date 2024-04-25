// routes/posts.js
const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const handleError = require("../handleError.js");
const handleSuccess = require("../handleSuccess.js");

router
  .get("/", async (req, res, next) => {
    const post = await Post.find();
    handleSuccess(res, post);
  })
  .post("/", async (req, res, next) => {
    try {
      const toPost = await Post.create(req.body);
      handleSuccess(res, toPost);
    } catch (err) {
      const newMessage = "資料傳輸或建立失敗";
      handleError(res, newMessage);
    }
  })
  .delete("/:id", async (req, res, next) => {
    try {
      const id = req.url.split("/").pop();
      await Post.findByIdAndDelete(id);
      handleSuccess(res, null);
    } catch (err) {
      handleError(res, err);
    }
  })
  .delete("/", async (req, res, next) => {
    await Post.deleteMany({});
    handleSuccess(res, null);
  })
  .patch("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const editPosts = await Post.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      handleSuccess(res, editPosts);
    } catch (err) {
      handleError(res, err);
    }
  });

module.exports = router;
