const express = require("express");
const router = express.Router();
const Post = require("../models/post.js");
const handleSuccess = require("../handleSuccess.js");
const appError = require("../statusHandle/appError");
const handleErrorAsync = require("../statusHandle/handleErrorAsync");

// 取得所有貼文

router.get("/", async (req, res) => {
  const post = await Post.find().populate("user");
  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
});

// 新增貼文
router.post(
  "/",
  handleErrorAsync(async (req, res, next) => {
    if (req.body.content == undefined) {
      next(appError(400, "你沒有填寫 content 資料"));
      return;
    }
    const newPost = await Post.create(req.body);
    handleSuccess(res, {
      post: newPost,
    });
  })
);

// 修改貼文
router.patch(
  "/:id",
  handleErrorAsync(async (req, res) => {
    const newpost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    handleSuccess(res, newpost);
  })
);

// 刪除貼文
router.delete(
  "/:id",
  handleErrorAsync(async (req, res) => {
    const delpost = await Post.findByIdAndDelete(req.params.id);
    handleSuccess(res, delpost);
  })
);

// 刪除所有貼文
router.delete(
  "/",
  handleErrorAsync(async (req, res) => {
    await Post.deleteMany({});
    handleSuccess(res, null);
  })
);

// 取得單一貼文

router.get(
  "/:id",
  handleErrorAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id).populate("user");
    if (!post) {
      return next(appError(404, "Post not found"));
    }
    handleSuccess(res, post);
  })
);

// 尋找對應id的Like
router.post(
  "/:id/like",
  handleErrorAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(appError(404, "Post not found"));
    }
    post.likes += 1;
    await post.save();
    handleSuccess(res, post);
  })
);

// 新增貼文的讚 點一次 +1
router.post(
  "/:id/like",
  handleErrorAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(appError(404, "Post not found"));
    }
    post.likes += 1;
    await post.save();
    handleSuccess(res, { likes: post.likes });
  })
);

// 取消貼文的讚 點一次 -1
router.delete(
  "/:id/unlike",
  handleErrorAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(appError(404, "Post not found"));
    }
    post.likes -= 1;
    await post.save();
    handleSuccess(res, { likes: post.likes });
  })
);

// 新增留言
router.post(
  "/:id/comment",
  handleErrorAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(appError(404, "Post not found"));
    }

    const newComment = {
      user: req.body.user,
      content: req.body.content,
    };
    post.comments.push(newComment);

    await post.save();

    handleSuccess(res, { comment: newComment });
  })
);

// 取得個人所有貼文列表
// router.get(
//   "/user/:userID",
//   handleErrorAsync(async (req, res, next) => {
//     const userID = req.params.userID;
//     const posts = await Post.find({ user: userID });
//     handleSuccess(res, { posts: posts });
//   })
// );



module.exports = router;
