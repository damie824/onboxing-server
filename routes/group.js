const express = require("express");
const { isNotLoggedIn, isLoggedIn } = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prismaClient = new PrismaClient();

//유저 그룹 불러오기
router.get("/get", isLoggedIn, async (req, res) => {
  try {
    const chatRooms = await prismaClient.group.findMany({
      where: {
        groupUsers: {
          some: {
            userId: req.user.id,
          },
        },
        purchased: false,
      },
    });

    res.status(200).json({
      success: true,
      msg: "successfully got chatrooms",
      data: chatRooms,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      msg: "internal server error",
      data: e.message,
    });
  }
});

//그룹 만들기
router.post("/new", isLoggedIn, async (req, res) => {
  try {
    const newGroup = await prismaClient.group.create({
      data: {
        locationX: req.body.locationX,
        locationY: req.body.locationY,
        purchased: false,
        title: req.body.title,
      },
    });

    const user = await prismaClient.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    await prismaClient.groupUser.create({
      data: {
        group: newGroup,
        user,
      },
    });

    res.status(200).json({
      success: true,
      msg: "successfully generated groups",
      data: newGroup,
    });
    return newGroup;
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "internal server error",
      data: error.message,
    });
  }
});

//그룹 검색하기
router.get("/search/:param/:page/:count", async (req, res) => {
  const { param, page, count } = req.params;

  try {
    const foundGroups = await prismaClient.group.findMany({
      take: Number(count),
      skip: Number(count) * Number(page),
      where: {
        title: {
          contains: param,
        },
      },
      orderBy: {
        locationX: {
          _distance: {
            locationX: req.body.locationX,
            locationY: req.body.locationY,
            order: "asc",
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      msg: "successfully get datas",
      data: foundGroups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "internal server error",
      data: error.message,
    });
  }
});

router.get("/chatrooms", isLoggedIn, async (req, res) => {
  try {
    const groupUser = await prismaClient.groupUser.findMany({
      where: {
        userId: req.user.id,
      },
    });
    const chatrooms = await prismaClient.group.findMany({
      where: {
        purchased: false,
        groupUsers: groupUser,
      },
    });

    res.status(200).json({
      success: true,
      msg: "successfully load chatrooms",
      data: chatrooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "internal server error",
      data: error.message,
    });
  }
});

//채팅 기록 불러오기
router.get("/chats/:roomid", isLoggedIn, (req, res) => {});

module.exports = router;
