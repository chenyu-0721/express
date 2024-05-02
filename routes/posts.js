const express = require("express");
const router = express.Router();
const Post = require("../models/post.js");
const handleSuccess = require("../handleSuccess.js");
const handleError = require("../handleError.js");
const User = require("../models/users");

// routes/posts.js

router.get('/', async(req, res) => {
    const post = await Post.find().populate('user');
    res.status(200).json({
        status: 'success',
        data: {
            post
        }
    });
})

router.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    if (data.content !== undefined) {
      const post = await Post.create({
        user: data.user,
        content: data.content,
        tags: data.tags,
        type: data.type,
      });

      handleSuccess(res, post);
    } else {
      const error = "欄位未填寫正確，或無此 todo ID";
      handleError(res, error);
    }
  } catch (err) {
    const error = "欄位未填寫正確，或無此 todo ID";
    handleError(res, error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const newpost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    handleSuccess(res, newpost);
  } catch (err) {
    const error = "編輯失敗";
    handleError(res, error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const delpost = await Post.findByIdAndDelete(req.params.id);
    handleSuccess(res, delpost);
  } catch (err) {
    const error = "刪除單筆失敗";
    handleError(res, error);
  }
});

router.delete("/", async function (req, res, next) {
  try {
    await Post.deleteMany({});
    handleSuccess(res, null);
  } catch (err) {
    handleError(res, err, "刪除所有貼文資料失敗");
  }
});

module.exports = router;
