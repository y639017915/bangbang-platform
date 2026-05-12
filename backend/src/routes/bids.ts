
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 创建投标
app.post("/api/tasks/:taskId/bids", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "未登录" });
    }

    const token = authHeader.split(" ")[1];
    const JWT_SECRET = process.env.JWT_SECRET || "bangbang-secret-key-change-in-production";
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const { taskId } = req.params;
    const { price, message } = req.body;

    // 检查任务是否存在
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      return res.status(404).json({ error: "任务不存在" });
    }

    // 不能给自己发布的任务投标
    if (task.userId === userId) {
      return res.status(400).json({ error: "不能给自己的任务投标" });
    }

    // 检查是否已经投过标
    const existingBid = await prisma.bid.findFirst({
      where: {
        taskId: parseInt(taskId),
        userId,
      },
    });

    if (existingBid) {
      return res.status(400).json({ error: "您已经投过标了" });
    }

    // 创建投标
    const bid = await prisma.bid.create({
      data: {
        price,
        message,
        taskId: parseInt(taskId),
        userId,
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, rating: true },
        },
      },
    });

    res.status(201).json({ bid });
  } catch (error) {
    console.error("创建投标错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 接受投标
app.put("/api/tasks/:taskId/bids/:bidId/accept", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "未登录" });
    }

    const token = authHeader.split(" ")[1];
    const JWT_SECRET = process.env.JWT_SECRET || "bangbang-secret-key-change-in-production";
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const { taskId, bidId } = req.params;

    // 检查任务是否存在且属于当前用户
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      return res.status(404).json({ error: "任务不存在" });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ error: "只有任务发布者可以接受投标" });
    }

    // 接受投标并更新任务状态
    const bid = await prisma.bid.update({
      where: { id: parseInt(bidId) },
      data: { status: "accepted" },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, rating: true },
        },
      },
    });

    // 将任务状态改为进行中
    await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { status: "in_progress" },
    });

    // 拒绝其他投标
    await prisma.bid.updateMany({
      where: {
        taskId: parseInt(taskId),
        id: { not: parseInt(bidId) },
        status: "pending",
      },
      data: { status: "rejected" },
    });

    res.json({ bid });
  } catch (error) {
    console.error("接受投标错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 拒绝投标
app.put("/api/tasks/:taskId/bids/:bidId/reject", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "未登录" });
    }

    const token = authHeader.split(" ")[1];
    const JWT_SECRET = process.env.JWT_SECRET || "bangbang-secret-key-change-in-production";
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const { taskId, bidId } = req.params;

    // 检查任务是否存在且属于当前用户
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      return res.status(404).json({ error: "任务不存在" });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ error: "只有任务发布者可以拒绝投标" });
    }

    const bid = await prisma.bid.update({
      where: { id: parseInt(bidId) },
      data: { status: "rejected" },
    });

    res.json({ bid });
  } catch (error) {
    console.error("拒绝投标错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取用户的投标列表
app.get("/api/bids/my", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "未登录" });
    }

    const token = authHeader.split(" ")[1];
    const JWT_SECRET = process.env.JWT_SECRET || "bangbang-secret-key-change-in-production";
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const bids = await prisma.bid.findMany({
      where: { userId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            budget: true,
            status: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ bids });
  } catch (error) {
    console.error("获取投标列表错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

