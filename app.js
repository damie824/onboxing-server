require("dotenv").config();

const express = require("express");

const port = process.env.PORT;

const cookieParser = require("cookie-parser");
const passport = require("passport");
const passportConfig = require("./auth");
const session = require("express-session");
const cors = require("cors");
const http = require("http");

const authRouter = require("./routes/auth");
const groupRouter = require("./routes/group");

const app = express();
passportConfig();

BigInt.prototype.toJSON = function () {
  return this.toString();
};

//Cors 설정
app.use(cors({ origin: true, credentials: true }));

//request 요청 URL과 처리 로직을 선언한 라우팅 모듈 매핑
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//세션 및 쿠키 설정
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

//패스포트 설정
app.use(passport.initialize());
app.use(passport.session());

//라우터 설정
app.use("/auth", authRouter);
app.use("/group", groupRouter);

//socket.io 설정
const server = http.Server(app);
require("./socket/chat")(server).listen(port, () => {
  console.log(`listening on port ${port}`);
});
