const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const prismaClient = new PrismaClient();

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.REST_KEY,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await prismaClient.user.findFirst({
            where: { snsId: String(profile.id) },
          });

          if (exUser) {
            done(null, exUser, {
              accessToken,
              refreshToken,
            });
            return;
          }

          const newUser = await prismaClient.user.create({
            data: {
              snsId: String(profile.id),
              username: profile._json.properties.nickname,
              profile: profile._json.properties.profile_image,
              rate: 0,
              rateCount: 0,
            },
          });

          console.log(newUser);
          done(null, newUser, {
            accessToken,
            refreshToken,
          });
        } catch (e) {
          console.log(e.message);
        }
      }
    )
  );
};
