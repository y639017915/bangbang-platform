
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "bangbang-secret-key-change-in-production";

// 验证token中间件
const authMiddleware = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "未登录" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    (req as any).userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: "登录已过期" });
  }
};

// 创建任务验证
const createTaskSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  category: z.string(),
  budget: z.number().positive(),
  deadline: z.string(),
  location: z.string(),
  urgent: z.boolean().optional(),
});

// 获取任务列表
app.get("/api/tasks", async (req: Request, res: Response) => {
  try {
    const { category, search, sort, urgent } = req.query;
    
    const where: any = {};
    
    if (category && category !== "all") {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }
    
    if (urgent === "true") {
      where.urgent = true;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-high") orderBy = { budget: "desc" };
    if (sort === "price-low") orderBy = { budget: "asc" };

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: { id: true, username: true, avatar: true, rating: true },
        },
        _count: { select: { bids: true } },
      },
    });

    res.json({ tasks });
  } catch (error) {
    console.error("获取任务列表错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取单个任务
app.get("/api/tasks/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, rating: true, bio: true },
        },
        bids: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true, rating: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: "任务不存在" });
    }

    res.json({ task });
  } catch (error) {
    console.error("获取任务错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 创建任务
app.post("/api/tasks", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createTaskSchema.parse(req.body);
    const userId = (req as any).userId;

    const task = await prisma.task.create({
      data: {
        ...data,
        deadline: new Date(data.deadline),
        userId,
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    res.status(201).json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "输入数据格式错误", details: error.errors });
    }
    console.error("创建任务错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 更新任务
app.put("/api/tasks/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
    
    if (!task) {
      return res.status(404).json({ error: "任务不存在" });
    }
    
    if (task.userId !== userId) {
      return res.status(403).json({ error: "无权修改此任务" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: req.body,
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    res.json({ task: updatedTask });
  } catch (error) {
    console.error("更新任务错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 删除任务
app.delete("/api/tasks/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
    
    if (!task) {
      return res.status(404).json({ error: "任务不存在" });
    }
    
    if (task.userId !== userId) {
      return res.status(403).json({ error: "无权删除此任务" });
    }

    await prisma.task.delete({ where: { id: parseInt(id) } });

    res.json({ message: "任务已删除" });
  } catch (error) {
    console.error("删除任务错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

