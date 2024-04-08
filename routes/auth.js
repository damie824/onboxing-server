const { isNotLoggedIn, isLoggedIn } = require("../middleware/auth");

const express = require("express");
const passport = require("passport");
const router = express.Router();

//카카오 로그인 요청 감지
router.get(
  "/kakao",
  isNotLoggedIn,
  passport.authenticate("kakao", {
    successRedirect: process.env.FRONTURL + "/",
  })
);

//카카오 로그인 콜백
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: process.env.FRONTURL + "/",
  }),
  (req, res) => {
    res.redirect(process.env.FRONTURL + "/");
  }
);

router.get("/check-login", isLoggedIn, (req, res) => {
  res.status(200).json({
    status: "ok",
    result: req.isAuthenticated(),
    user: req.user,
  });
});

module.exports = router;
