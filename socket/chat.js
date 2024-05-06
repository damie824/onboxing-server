module.exports = (server) => {
  const { PrismaClient } = require("@prisma/client");
  const socketIO = require("socket.io");
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  const prismaClient = new PrismaClient();

  console.log("Initializng socket.io..");

  //채팅 기능 초기화
  io.on("connection", (socket) => {
    //방 입장 관리
    socket.on("enter_room", async (roomId) => {
      const foundChatroom = await prismaClient.group.findUnique({
        where: {
          id: Number(roomId),
        },
      });

      if (!foundChatroom) {
        socket.emit("error", "채팅방을 찾을 수 없습니다.");
        return;
      }

      socket.join(roomId);
      console.log(`new user connected to ${roomId}`);
      socket.to(roomId).emit("welcome");
    });

    //메시지 전송 관리
    socket.on("message", async (msg, roomId, userId) => {
      console.log(`roomId : ${roomId}`);
      console.log(`userId: ${userId}`);
      console.log(`message : ${msg}`);
      try {
        const foundChatroom = await prismaClient.group.findUnique({
          where: {
            id: Number(roomId),
          },
        });
        const foundUser = await prismaClient.user.findUnique({
          where: {
            id: Number(userId),
          },
        });

        if (!foundChatroom) {
          console.log("채팅방 못 찾음");
          socket.emit("error", "채팅방을 찾을 수 없습니다.");
          return;
        }

        if (!foundUser) {
          console.log("유저 못 찾음");
          socket.emit("error", "사용자를 찾을 수 없습니다.");
          return;
        }

        const date = new Date();

        await prismaClient.chat.create({
          data: {
            contents: msg,
            group: {
              connect: { id: foundChatroom.id },
            },
            user: {
              connect: { id: foundUser.id },
            },
            createdAt: date,
          },
        });
      } catch (error) {
        console.log(error.message);
        socket.emit("error", "Internal server error");
        return;
      }
      io.to(roomId).emit("message", msg, Number(userId));
    });
  });

  return server;
};
