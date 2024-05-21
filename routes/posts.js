const express = require("express");
const router = express.Router();
const Post = require("../models/post.js");
const handleSuccess = require("../handleSuccess.js");
const appError = require("../statusHandle/appError");
const handleErrorAsync = require("../statusHandle/handleErrorAsync");

// * jwt  start

const jwt = require("jsonwebtoken");

// * jwt  end

router.get("/", async (req, res) => {
  const post = await Post.find().populate("user");
  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
});
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

router.patch(
  "/:id",
  handleErrorAsync(async (req, res) => {
    const newpost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    handleSuccess(res, newpost);
  })
);

router.delete(
  "/:id",
  handleErrorAsync(async (req, res) => {
    const delpost = await Post.findByIdAndDelete(req.params.id);
    handleSuccess(res, delpost);
  })
);

router.delete(
  "/",
  handleErrorAsync(async (req, res) => {
    await Post.deleteMany({});
    handleSuccess(res, null);
  })
);

module.exports = router;

// router.post(
//   "/",
//   handleErrorAsync(async (req, res, next) => {
//     if (req.body.content == undefined) {
//       next(appError(400, "你沒有填寫 content 資料"));
//     }
//     const newPost = await Post.create(req.body);
//     res.status(200).json({
//       status: "success",
//       post: newPost,
//     });
//   })
// );

// router.patch("/:id", async (req, res, next) => {
//   try {
//     const newpost = await Post.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     handleSuccess(res, newpost);
//   } catch (err) {
//     const error = "編輯失敗";
//     handleError(res, error);
//   }
// });

// router.delete("/:id", async (req, res, next) => {
//   try {
//     const delpost = await Post.findByIdAndDelete(req.params.id);
//     handleSuccess(res, delpost);
//   } catch (err) {
//     const error = "刪除單筆失敗";
//     handleError(res, error);
//   }
// });

// router.delete("/", async function (req, res, next) {
//   try {
//     await Post.deleteMany({});
//     handleSuccess(res, null);
//   } catch (err) {
//     handleError(res, err, "刪除所有貼文資料失敗");
//   }
// });
