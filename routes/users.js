const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const appError = require("../statusHandle/appError");
const handleErrorAsync = require("../statusHandle/handleErrorAsync");
const { isAuth, generateSendJWT } = require("../statusHandle/auth");
const User = require("../models/users");
const router = express.Router();

/* * GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/**
 * * 註冊
 */

router.post(
  "/sign_up",
  handleErrorAsync(async (req, res, next) => {
    let { email, password, confirmPassword, name } = req.body;
    // 內容不可為空
    if (!email || !password || !confirmPassword || !name) {
      return next(appError(400, "欄位未填寫正確！", next));
    }
    // 密碼正確
    if (password !== confirmPassword) {
      return next(appError(400, "密碼不一致！", next));
    }
    // 密碼 8 碼以上
    if (!validator.isLength(password, { min: 8 })) {
      return next(appError(400, "密碼字數低於 8 碼", next));
    }
    // 是否為 Email
    if (!validator.isEmail(email)) {
      return next(appError(400, "Email 格式不正確", next));
    }

    // 加密密碼
    password = await bcrypt.hash(req.body.password, 12);
    const newUser = await User.create({
      email,
      password,
      name,
    });
    generateSendJWT(newUser, 201, res);
  })
);

/**
 *  * 登入密碼
 */
router.post(
  "/sign_in",
  handleErrorAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, "帳號密碼不可為空", next));
    }
    const user = await User.findOne({ email }).select("+password");
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError(400, "您的密碼不正確", next));
    }
    generateSendJWT(user, 200, res);
  })
);

/**
 * * 重設密碼
 */

router.post(
  "/updatePassword",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return next(appError(400, "密碼不一致！", next));
    }
    if (!validator.isLength(password, { min: 8 })) {
      return next(appError(400, "密碼字數低於 8 碼", next));
    }

    newPassword = await bcrypt.hash(password, 12);

    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword,
    });
    generateSendJWT(user, 200, res);
  })
);

/**
 * * 取得個人資料
 */
router.get(
  "/profile",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
      status: "success",
      data: {
        user: {
          name: user.name,
          sex: user.sex,
          email: user.email,
          photo: user.photo,
          password: user.password,
          createdAt: user.createdAt,
        },
      },
    });
  })
);

/**
 * *更新個人訊息
 */
router.patch(
  "/profile",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { name, sex, photo } = req.body;
    if (!validator.isLength(name, { min: 4 })) {
      return next(appError(400, "名字低於4個字", next));
    }
    const user = await User.findByIdAndUpdate(req.user.id, {
      name,
      sex,
      photo,
    });
    res.status(200).json({
      status: "success",
      data: {
        user: {
          name: user.name,
          sex: user.sex,
          photo: user.photo,
        },
      },
    });
  })
);

// followers 欄位對應的是自己被其他使用者追蹤
// following 欄位則是對應自己追蹤的使用者
router.post(
  "/:id/follow",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.user.id) {
      return next(appError(401, "您無法追蹤自己", next));
    }
    // 更新自己追蹤的部分
    await User.updateOne(
      {
        _id: req.user.id,
        "following.user": { $ne: req.params.id },
      },
      {
        $addToSet: { following: { user: req.params.id } },
      }
    );
    // 更新被追蹤者的部分
    await User.updateOne(
      {
        _id: req.params.id,
        "followers.user": { $ne: req.user.id },
      },
      {
        $addToSet: { followers: { user: req.user.id } },
      }
    );
    res.status(200).json({
      status: "success",
      message: "您已成功追蹤！",
    });
  })
);

// 取消追蹤
router.delete(
  "/:id/unfollow",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.user.id) {
      return next(appError(401, "您無法取消追蹤自己", next));
    }

    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { following: { user: req.params.id } } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      req.params.id,
      { $pull: { followers: { user: req.user.id } } },
      { new: true }
    );
    res.status(200).json({
      status: "success",
      message: "您已成功取消追蹤！",
    });
  })
);

// 取得個人按讚列表
router.get(
  "/getLikeList",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("likedPosts", "content"); // 假設 likedPosts 是用戶按讚過的貼文的參考
    if (!user) {
      return next(appError(404, "使用者未找到"));
    }
    res.status(200).json({
      status: "success",
      data: {
        likedPosts: user.likedPosts,
      },
    });
  })
);

// 取得個人追蹤名單 功能

router.get(
  "/following",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const followList = await User.find({
      _id: req.user.id,
    }).select("following");

    res.status(200).json({
      status: "success",
      followList,
    });
  })
);
module.exports = router;
