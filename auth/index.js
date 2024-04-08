const passport = require("passport");
const kakao = require("./kakaoStrategy");
const { PrismaClient } = require("@prisma/client");

const prismaClient = new PrismaClient();

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    prismaClient.user
      .findUnique({
        where: {
          id,
        },
      })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  kakao();
};
