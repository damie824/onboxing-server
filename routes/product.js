import express from "express";
import { isNotLoggedIn, isLoggedIn } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prismaClient = new PrismaClient();

//새 상품 업로드
router.post("/upload", isLoggedIn, async (req, res) => {
  const body = req.body;

  const date = new Date();
  date.setHours(date.getHours() + 9);

  try {
    const store = await prismaClient.store.findUnique({
      where: {
        id: body.store_id,
      },
    });
    const newProduct = await prismaClient.product.create({
      data: {
        title: body.title,
        contents: body.contents,
        price: body.price,
        createdAt: date,
        store,
      },
    });
    res.status(200).json({
      success: true,
      msg: "product successfully created.",
      data: newProduct,
    });
  } catch (error) {
    console.warn(error.message);
    res.status(500).json({
      success: false,
      msg: "internal server error",
      data: error.message,
    });
  }
});

//상품 전체 조회
router.get("/get-all/:page/:take", async (req, res) => {
  try {
    const { page, take } = req.params;

    const products = await prismaClient.product.findMany({
      take: take * 1,
      skip: (Number(page) - 1) * 8,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        store: {
          select: {
            title: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      msg: `loaded ${products.length} products.`,
      data: {
        products,
        page,
        
      },
    });
  } catch (error) {
    console.warn(error.message);
    res.status(500).json({
      success: false,
      msg: "internal server error",
      data: error.message,
    });
  }
});

//상품 검색
router.get("/search/:param/:page", async (req, res) => {
  try {
    const { param, page } = req.params;

    const products = await prismaClient.product.findMany({
      where: {
        title: {
          contains: param,
        },
      },
      take: take * 1,
      skip: (Number(page) - 1) * 8,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        store: {
          select: {
            title: true,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      msg: `loaded ${products.length} products.`,
      data: products,
    });
  } catch (error) {
    console.warn(error.message);
    res.status(500).json({
      success: false,
      msg: "internal server error",
      data: error.message,
    });
  }
});

module.exports = router;
