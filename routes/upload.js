// routes/upload.js
const express = require("express");
const router = express.Router();
const appError = require("../statusHandle/appError");
const handleErrorAsync = require("../statusHandle/handleErrorAsync");
const upload = require("../routes/upload.js");

const { v4: uuidv4 } = require("uuid");
const firebaseAdmin = require("../service/firebase");
const bucket = firebaseAdmin.storage().bucket(); 

const { isAuth, generateSendJWT } = require("../service/auth");

router.post(
  "/file",
  isAuth,
  upload,
  handleErrorAsync(async (req, res, next) => {
    if (!req.files.length) {
      return next(appError(400, "尚未上傳檔案", next));
    }
    // 取得檔案資訊列表裡面一個檔案
    const file = req.files[0];
    // 建立一個 blob 物件
    const blob = bucket.file(
      `images/${uuidv4()}.${file.originalname.split(".").pop()}`
    );
    // 建立寫入 blob 物件
    const blobStream = blob.createWriteStream();

    // 將 buffer 寫入 blobStream
    blobStream.end(file.buffer);

    // 監聽上傳狀態，會觸發 finish 事件
    blobStream.on("finish", () => {
      // 設定存取權限
      const config = {
        action: "read", // 權限
        expires: "12-31-2500", //有效期限
      };
      // 取得檔案的網址
      blob.getSignedUrl(config, (err, fileUrl) => {
        res.send({
          fileUrl,
        });
      });
    });

    // 如果上傳過程中發生錯誤，會觸發 error 事件
    blobStream.on("error", (err) => {
      res.status(500).send("上傳失敗");
    });
  })
);
module.exports = router;
