
# 帮帮平台 - 完整开发项目

## 📋 项目概述

这是帮帮平台的完整开发项目，包含前后端代码。

## 🚀 技术栈

| 部分 | 技术 |
|------|------|
| **前端** | React + TypeScript + Tailwind CSS |
| **后端** | Node.js + Express + TypeScript |
| **数据库** | PostgreSQL (使用Prisma ORM) |
| **认证** | JWT + bcrypt |
| **支付** | 微信支付/支付宝 (预留接口) |

## 📂 项目结构

```
bangbang-platform/
├── backend/          # 后端服务
│   ├── src/
│   │   ├── models/   # 数据库模型
│   │   ├── routes/   # API路由
│   │   ├── services/ # 业务逻辑
│   │   └── index.ts  # 入口文件
│   └── package.json
├── frontend/         # 前端应用
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   └── package.json
├── docs/             # 文档
└── README.md
```

## 🛠️ 快速开始

### 前置要求
- Node.js 18+
- PostgreSQL 14+

### 后端启动
```bash
cd backend
npm install
npm run dev
```

### 前端启动
```bash
cd frontend
npm install
npm run dev
```

## 📖 更多文档

详细开发文档请参考：
- [后端API文档](./backend/README.md)
- [前端开发文档](./frontend/README.md)
- [数据库设计](./docs/DATABASE.md)

