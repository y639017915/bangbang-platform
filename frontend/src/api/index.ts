
import axios from "axios";

const API_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 添加token到请求头
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 认证相关API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post("/api/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),

  getMe: () => api.get("/api/auth/me"),

  updateProfile: (data: { username?: string; bio?: string; skills?: string[]; avatar?: string }) =>
    api.put("/api/auth/profile", data),
};

// 任务相关API
export const taskAPI = {
  getTasks: (params?: {
    category?: string;
    search?: string;
    sort?: string;
    urgent?: boolean;
  }) => api.get("/api/tasks", { params }),

  getTask: (id: number) => api.get(`/api/tasks/${id}`),

  createTask: (data: {
    title: string;
    description: string;
    category: string;
    budget: number;
    deadline: string;
    location: string;
    urgent?: boolean;
  }) => api.post("/api/tasks", data),

  updateTask: (id: number, data: any) => api.put(`/api/tasks/${id}`, data),

  deleteTask: (id: number) => api.delete(`/api/tasks/${id}`),
};

// 投标相关API
export const bidAPI = {
  getBids: (taskId: number) => api.get(`/api/tasks/${taskId}/bids`),

  createBid: (taskId: number, data: { price: number; message: string }) =>
    api.post(`/api/tasks/${taskId}/bids`, data),

  acceptBid: (taskId: number, bidId: number) =>
    api.put(`/api/tasks/${taskId}/bids/${bidId}/accept`),

  rejectBid: (taskId: number, bidId: number) =>
    api.put(`/api/tasks/${taskId}/bids/${bidId}/reject`),
};

export default api;

