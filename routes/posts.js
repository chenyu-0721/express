// routes/posts.js
const express = require("express");
const router = express.Router();
const Post = require("../models/post");



router
  .get("/", async (req, res, next) => {
    const post = await Post.find();
    handleSuccess(res, post);
  })
  .post("/", async (req, res, next) => {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if (data.content !== undefined) {
          const newPost = await Post.create({
            name: data.name,
            content: data.content,
          });
          handleSuccess(res, newPost);
        } else {
          const message = "欄位未填寫正確，或無該筆貼文 id";
          handleError(res, message);
        }
      } catch (error) {
        handleError(res, error);
      }
    });
  })
  .delete("/:id", async (req, res, next) => {
    const id = req.url.split("/").pop();
    try {
      await Post.findByIdAndDelete(id);
      handleSuccess(res, null);
    } catch (err) {
      handleError(res, err);
    }
  })
  .delete("/", async (req, res, next) => {
    await Post.deleteMany();
    const newMessage = "已刪除全部貼文";
    handleSuccess(res, newMessage);
  })
  .patch("/:id", async (req, res, next) => {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);

        if (data !== undefined) {
          const id = req.url.split("/").pop();
          await Post.findByIdAndUpdate({ _id: id }, data, { new: true });
          const newData = await Post.find({ _id: id });
          handleSuccess(res, newData);
        } else {
          const message = "欄位未填寫正確，或無該筆貼文 id";
          handleError(res, message);
        }
      } catch (error) {
        const message = error;
        handleError(res, message);
      }
    });
  });

module.exports = router;
