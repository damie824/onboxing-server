//로그인 감지
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect(process.env.FRONTURL + "/login");
  }
};

//로그인 감지
exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect(process.env.FRONTURL + "/");
  }
};
