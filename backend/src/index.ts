
import express from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { userDB, taskDB, bidDB } from "./data";

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "bangbang-secret-key-change-in-production";

app.use(cors());
app.use(helmet());
app.use(express.json());

// ==================== 认证相关 ====================

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// 注册
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);
    
    // 检查用户是否存在
    const existingUser = userDB.findByEmail(email) || userDB.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "用户名或邮箱已存在" });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = userDB.create({
      username,
      email,
      password: hashedPassword,
    });

    // 生成token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "输入数据格式错误", details: error.errors });
    }
    res.status(500).json({ error: "服务器错误" });
  }
});

// 登录
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // 查找用户
    const user = userDB.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "邮箱或密码错误" });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "邮箱或密码错误" });
    }

    // 生成token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "输入数据格式错误" });
    }
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取当前用户
app.get("/api/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "未登录" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = userDB.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "用户不存在" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch {
    res.status(401).json({ error: "登录已过期" });
  }
});

// 更新用户信息
app.put("/api/auth/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "未登录" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const { username, bio, skills, avatar } = req.body;

    const user = userDB.update(decoded.userId, { username, bio, skills, avatar });
    if (!user) {
      return res.status(404).json({ error: "用户不存在" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch {
    res.status(500).json({ error: "服务器错误" });
  }
});

// ==================== 任务相关 ====================

const createTaskSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  category: z.string(),
  budget: z.number().positive(),
  deadline: z.string(),
  location: z.string(),
  urgent: z.boolean().optional(),
});

const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "未登录" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: "登录已过期" });
  }
};

// 获取任务列表
app.get("/api/tasks", async (req, res) => {
  try {
    const { category, search, sort, urgent } = req.query;
    let tasks = taskDB.getAll();
    
    // 分类筛选
    if (category && category !== "all") {
      tasks = tasks.filter((t: any) => t.category === category);
    }
    
    // 搜索
    if (search) {
      const searchStr = (search as string).toLowerCase();
      tasks = tasks.filter((t: any) => 
        t.title.toLowerCase().includes(searchStr) ||
        t.description.toLowerCase().includes(searchStr)
      );
    }
    
    // 加急筛选
    if (urgent === "true") {
      tasks = tasks.filter((t: any) => t.urgent);
    }

    // 排序
    if (sort === "price-high") {
      tasks.sort((a: any, b: any) => b.budget - a.budget);
    } else if (sort === "price-low") {
      tasks.sort((a: any, b: any) => a.budget - b.budget);
    } else {
      tasks.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // 添加用户信息和投标数量
    const tasksWithDetails = tasks.map((task: any) => {
      const user = userDB.findById(task.userId);
      const bids = bidDB.findByTaskId(task.id);
      const { password: _, ...userWithoutPassword } = user || {};
      return {
        ...task,
        user: userWithoutPassword,
        _count: { bids: bids.length },
      };
    });

    res.json({ tasks: tasksWithDetails });
  } catch {
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取单个任务
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const task = taskDB.findById(parseInt(req.params.id));
    if (!task) return res.status(404).json({ error: "任务不存在" });

    const user = userDB.findById(task.userId);
    const bids = bidDB.findByTaskId(task.id).map((bid: any) => {
      const bidder = userDB.findById(bid.userId);
      const { password: _, ...bidderWithoutPassword } = bidder || {};
      return { ...bid, user: bidderWithoutPassword };
    });

    const { password: _, ...userWithoutPassword } = user || {};
    res.json({ 
      task: { 
        ...task, 
        user: userWithoutPassword,
        bids 
      } 
    });
  } catch {
    res.status(500).json({ error: "服务器错误" });
  }
});

// 创建任务
app.post("/api/tasks", authMiddleware, async (req: any, res) => {
  try {
    const data = createTaskSchema.parse(req.body);
    const task = taskDB.create({
      ...data,
      deadline: new Date(data.deadline).toISOString(),
      userId: req.userId,
    });

    const user = userDB.findById(req.userId);
    const { password: _, ...userWithoutPassword } = user || {};
    res.status(201).json({ task: { ...task, user: userWithoutPassword } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: "输入数据格式错误" });
    res.status(500).json({ error: "服务器错误" });
  }
});

// 更新任务
app.put("/api/tasks/:id", authMiddleware, async (req: any, res) => {
  try {
    const task = taskDB.findById(parseInt(req.params.id));
    if (!task) return res.status(404).json({ error: "任务不存在" });
    if (task.userId !== req.userId) return res.status(403).json({ error: "无权修改此任务" });

    const updatedTask = taskDB.update(parseInt(req.params.id), req.body);
    const user = userDB.findById(req.userId);
    const { password: _, ...userWithoutPassword } = user || {};
    res.json({ task: { ...updatedTask, user: userWithoutPassword } });
  } catch {
    res.status(500).json({ error: "服务器错误" });
  }
});

// 删除任务
app.delete("/api/tasks/:id", authMiddleware, async (req: any, res) => {
  try {
    const task = taskDB.findById(parseInt(req.params.id));
    if (!task) return res.status(404).json({ error: "任务不存在" });
    if (task.userId !== req.userId) return res.status(403).json({ error: "无权删除此任务" });

    taskDB.delete(parseInt(req.params.id));
    res.json({ message: "任务已删除" });
  } catch {
    res.status(500).json({ error: "服务器错误" });
  }
});

// ==================== 投标相关 ====================

// 创建投标
app.post("/api/tasks/:taskId/bids", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "未登录" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const task = taskDB.findById(parseInt(req.params.taskId));
    if (!task) return res.status(404).json({ error: "任务不存在" });
    if (task.userId === userId) return res.status(400).json({ error: "不能给自己的任务投标" });

    const existingBid = bidDB.findByTaskAndUser(parseInt(req.params.taskId), userId);
    if (existingBid) return res.status(400).json({ error: "您已经投过标了" });

    const bid = bidDB.create({
      price: req.body.price,
      message: req.body.message,
      taskId: parseInt(req.params.taskId),
      userId,
    });

    const user = userDB.findById(userId);
    const { password: _, ...userWithoutPassword } = user || {};
    res.status(201).json({ bid: { ...bid, user: userWithoutPassword } });
  } catch {
    res.status(500).json({ error: "服务器错误" });
  }
});

// 接受投标
app.put("/api/tasks/:taskId/bids/:bidId/accept", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "未登录" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const task = taskDB.findById(parseInt(req.params.taskId));
    if (!task) return res.status(404).json({ error: "任务不存在" });
    if (task.userId !== userId) return res.status(403).json({ error: "只有任务发布者可以接受投标" });

    const bid = bidDB.update(parseInt(req.params.bidId), { status: "accepted" });
    taskDB.update(parseInt(req.params.taskId), { status: "in_progress" });
    
    bidDB.updateMany(
      { taskId: parseInt(req.params.taskId), status: "pending" },
      { status: "rejected" }
    );

    const user = userDB.findById(bid?.userId || 0);
    const { password: _, ...userWithoutPassword } = user || {};
    res.json({ bid: { ...bid, user: userWithoutPassword } });
  } catch {
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取我的投标
app.get("/api/bids/my", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "未登录" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const bids = bidDB.findByUserId(decoded.userId).map((bid: any) => {
      const task = taskDB.findById(bid.taskId);
      return { ...bid, task };
    });

    res.json({ bids });
  } catch {
    res.status(500).json({ error: "服务器错误" });
  }
});

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "帮帮平台后端服务运行中（文件存储模式）" });
});

app.listen(PORT, () => {
  console.log(`✅ 后端服务已启动: http://localhost:${PORT}`);
  console.log(`📁 数据存储: 文件模式（无需数据库）`);
});

