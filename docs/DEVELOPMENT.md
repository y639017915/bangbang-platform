
# 帮帮平台 - 开发指南

## 🚀 快速开始

### 前置准备

1. **安装 Node.js (推荐 18+)**
   - 下载：https://nodejs.org

2. **安装 PostgreSQL (推荐 14+)**
   - 下载：https://www.postgresql.org/download

---

## 📦 后端开发

### 安装依赖

```bash
cd backend
npm install
```

### 配置数据库

1. 复制 `.env.example` 为 `.env`
2. 修改 `DATABASE_URL` 为你的 PostgreSQL 连接字符串

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bangbang?schema=public"
```

### 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 启动开发服务器

```bash
npm run dev
```

后端服务运行在：http://localhost:3001

---

## 🎨 前端开发

### 安装依赖

```bash
cd frontend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

前端应用运行在：http://localhost:3000

---

## 📖 开发说明

### 核心功能模块

| 模块 | 状态 | 说明 |
|------|------|------|
| 用户认证 | ⏳ 待开发 | 登录/注册/JWT |
| 任务管理 | ⏳ 待开发 | 发布/查看/筛选 |
| 投标系统 | ⏳ 待开发 | 接单/出价/选择 |
| 支付模块 | ⏳ 待开发 | 资金托管/提现 |
| 评价系统 | ⏳ 待开发 | 评分/评论/信誉 |

### 项目路线图

#### 第一阶段 (MVP) - 1-2周
- [ ] 用户登录/注册
- [ ] 发布任务
- [ ] 查看任务列表
- [ ] 基础投标功能

#### 第二阶段 - 3-4周
- [ ] 完整的投标/接单流程
- [ ] 评价系统
- [ ] 信誉积分

#### 第三阶段 - 5-6周
- [ ] 支付集成
- [ ] 资金托管
- [ ] 完整的移动端适配

---

## 🔧 常用命令

### 后端
```bash
cd backend
npm run dev          # 开发模式
npm run build        # 编译
npm start            # 生产模式
```

### 前端
```bash
cd frontend
npm run dev          # 开发模式
npm run build        # 编译
npm run preview      # 预览生产版本
```

---

## 📚 更多文档

- [数据库设计](./DATABASE.md)
- [API文档](./API.md)
- [部署指南](./DEPLOY.md)

