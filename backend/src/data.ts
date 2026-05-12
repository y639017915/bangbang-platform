
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const BIDS_FILE = path.join(DATA_DIR, "bids.json");

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 读取数据
function readData(filePath: string): any[] {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
    return [];
  }
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

// 写入数据
function writeData(filePath: string, data: any[]) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 生成ID
function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// 用户操作
export const userDB = {
  getAll: () => readData(USERS_FILE),
  
  findById: (id: number) => {
    const users = readData(USERS_FILE);
    return users.find((u: any) => u.id === id);
  },
  
  findByEmail: (email: string) => {
    const users = readData(USERS_FILE);
    return users.find((u: any) => u.email === email);
  },
  
  findByUsername: (username: string) => {
    const users = readData(USERS_FILE);
    return users.find((u: any) => u.username === username);
  },
  
  create: (userData: any) => {
    const users = readData(USERS_FILE);
    const newUser = {
      id: generateId(),
      ...userData,
      avatar: null,
      bio: null,
      skills: [],
      rating: 5.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeData(USERS_FILE, users);
    return newUser;
  },
  
  update: (id: number, data: any) => {
    const users = readData(USERS_FILE);
    const index = users.findIndex((u: any) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...data, updatedAt: new Date().toISOString() };
    writeData(USERS_FILE, users);
    return users[index];
  },
};

// 任务操作
export const taskDB = {
  getAll: () => readData(TASKS_FILE),
  
  findById: (id: number) => {
    const tasks = readData(TASKS_FILE);
    return tasks.find((t: any) => t.id === id);
  },
  
  create: (taskData: any) => {
    const tasks = readData(TASKS_FILE);
    const newTask = {
      id: generateId(),
      ...taskData,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    writeData(TASKS_FILE, tasks);
    return newTask;
  },
  
  update: (id: number, data: any) => {
    const tasks = readData(TASKS_FILE);
    const index = tasks.findIndex((t: any) => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...data, updatedAt: new Date().toISOString() };
    writeData(TASKS_FILE, tasks);
    return tasks[index];
  },
  
  delete: (id: number) => {
    const tasks = readData(TASKS_FILE);
    const filtered = tasks.filter((t: any) => t.id !== id);
    writeData(TASKS_FILE, filtered);
    return true;
  },
};

// 投标操作
export const bidDB = {
  getAll: () => readData(BIDS_FILE),
  
  findById: (id: number) => {
    const bids = readData(BIDS_FILE);
    return bids.find((b: any) => b.id === id);
  },
  
  findByTaskId: (taskId: number) => {
    const bids = readData(BIDS_FILE);
    return bids.filter((b: any) => b.taskId === taskId);
  },
  
  findByUserId: (userId: number) => {
    const bids = readData(BIDS_FILE);
    return bids.filter((b: any) => b.userId === userId);
  },
  
  findByTaskAndUser: (taskId: number, userId: number) => {
    const bids = readData(BIDS_FILE);
    return bids.find((b: any) => b.taskId === taskId && b.userId === userId);
  },
  
  create: (bidData: any) => {
    const bids = readData(BIDS_FILE);
    const newBid = {
      id: generateId(),
      ...bidData,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    bids.push(newBid);
    writeData(BIDS_FILE, bids);
    return newBid;
  },
  
  update: (id: number, data: any) => {
    const bids = readData(BIDS_FILE);
    const index = bids.findIndex((b: any) => b.id === id);
    if (index === -1) return null;
    bids[index] = { ...bids[index], ...data, updatedAt: new Date().toISOString() };
    writeData(BIDS_FILE, bids);
    return bids[index];
  },
  
  updateMany: (filter: any, data: any) => {
    const bids = readData(BIDS_FILE);
    bids.forEach((bid: any, index: number) => {
      let match = true;
      for (const key in filter) {
        if (bid[key] !== filter[key]) {
          match = false;
          break;
        }
      }
      if (match) {
        bids[index] = { ...bid, ...data, updatedAt: new Date().toISOString() };
      }
    });
    writeData(BIDS_FILE, bids);
    return true;
  },
};

