var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var postsRouter = require("./routes/posts");
const port = process.env.PORT || 4000;
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const uploadRouter = require("./routes/upload");
var app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

process.on("uncaughtException", (err) => {
  console.error("Uncaughted Exception！");
  console.error(err);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log("資料庫連接成功"));

// mongoose 結束

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/upload", uploadRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// express 錯誤處理
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
    });
  } else {
    // log 紀錄
    console.error("出現重大錯誤", err);
    // 送出罐頭預設訊息
    res.status(500).json({
      status: "error",
      message: "系統錯誤，請恰系統管理員",
    });
  }
};

// 開發環境錯誤
const resErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// 錯誤處理
app.use(function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  // 開發環境
  if (process.env.NODE_ENV === "dev") {
    return resErrorDev(err, res);
  }
  // 正式環境
  if (err.isAxiosError == true) {
    err.message = "axios 連線錯誤";
    err.isOperational = true;
    return resErrorProd(err, res);
  } else if (err.name === "ValidationError") {
    // mongoose 資料辨識錯誤
    err.message = "資料欄位未填寫正確，請重新輸入！";
    err.isOperational = true;
    return resErrorProd(err, res);
  }
  resErrorProd(err, res);
});

// 未捕捉到的 catch
process.on("unhandledRejection", (err, promise) => {
  console.error("未捕捉到的 rejection：", promise, "原因：", err);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
module.exports = app;
