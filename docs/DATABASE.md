
# 数据库设计文档

## 📊 数据表说明

### 用户表 (User)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| username | String | 用户名 |
| email | String | 邮箱 |
| password | String | 密码(加密) |
| avatar | String? | 头像URL |
| bio | String? | 个人简介 |
| skills | String[] | 技能标签 |
| rating | Float | 平均评分 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

---

### 任务表 (Task)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| title | String | 任务标题 |
| description | String | 任务描述 |
| category | String | 分类 |
| budget | Float | 预算金额 |
| deadline | DateTime | 截止时间 |
| location | String | 地点 |
| urgent | Boolean | 是否加急 |
| status | String | 状态(open/in_progress/completed) |
| userId | Int | 发布者ID |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

---

### 投标表 (Bid)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| price | Float | 出价 |
| message | String | 留言 |
| taskId | Int | 关联任务ID |
| userId | Int | 投标者ID |
| status | String | 状态(pending/accepted/rejected) |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

---

## 🔗 关系说明

- User 1 → ∞ Task (一个用户可以发布多个任务)
- User 1 → ∞ Bid (一个用户可以投标多个任务)
- Task 1 → ∞ Bid (一个任务可以有多个投标)

