
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { taskAPI } from "../api";

export default function Home() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setCurrentUser(JSON.parse(user));
    fetchTasks();
  }, [category, sort]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskAPI.getTasks({ category, search, sort });
      setTasks(res.data.tasks);
    } catch (error) {
      console.error("获取任务失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const categories = [
    { key: "all", label: "全部", icon: "📋" },
    { key: "体力劳动", label: "体力劳动", icon: "💪" },
    { key: "专业技能", label: "专业技能", icon: "💻" },
    { key: "教育培训", label: "教育培训", icon: "📚" },
    { key: "生活服务", label: "生活服务", icon: "🏠" },
    { key: "商业项目", label: "商业项目", icon: "💼" },
  ];

  return (
    <div className="app">
      {/* 导航栏 */}
      <nav className="navbar">
        <h1 className="logo">帮帮<span>.</span></h1>
        <div className="nav-right">
          {currentUser ? (
            <>
              <Link to="/publish" className="btn btn-primary">发布任务</Link>
              <Link to="/profile" className="btn btn-outline">个人中心</Link>
              <button onClick={handleLogout} className="btn btn-outline">退出</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">登录/注册</Link>
          )}
        </div>
      </nav>

      {/* 搜索栏 */}
      <div className="search-section">
        <input
          type="text"
          placeholder="搜索任务名称..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchTasks()}
        />
        <button onClick={fetchTasks}>搜索</button>
      </div>

      {/* 分类筛选 */}
      <div className="categories">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`category-btn ${category === cat.key ? "active" : ""}`}
            onClick={() => setCategory(cat.key)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 排序 */}
      <div className="sort-bar">
        <span>共 {tasks.length} 个任务</span>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">最新发布</option>
          <option value="price-high">价格最高</option>
          <option value="price-low">价格最低</option>
        </select>
      </div>

      {/* 任务列表 */}
      <div className="tasks-grid">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : tasks.length === 0 ? (
          <div className="empty">暂无任务</div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="task-card" onClick={() => navigate(`/task/${task.id}`)}>
              <div className="task-header">
                <span className="task-category">{task.category}</span>
                {task.urgent && <span className="task-urgent">⚡ 加急</span>}
              </div>
              <h3 className="task-title">{task.title}</h3>
              <p className="task-desc">{task.description.substring(0, 80)}...</p>
              <div className="task-meta">
                <span>⏰ {new Date(task.deadline).toLocaleDateString()}</span>
                <span>📍 {task.location}</span>
              </div>
              <div className="task-footer">
                <span className="task-price">¥{task.budget}</span>
                <span className="task-bids">{task._count?.bids || 0} 人投标</span>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .app {
          min-height: 100vh;
          background: linear-gradient(180deg, #0F172A 0%, #1E1B4B 100%);
          padding-bottom: 3rem;
        }

        .navbar {
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(20px);
          padding: 1rem 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-right {
          display: flex;
          gap: 0.8rem;
        }

        .btn {
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          border: none;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }

        .btn-outline {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
        }

        .btn-outline:hover {
          border-color: #6366F1;
          background: rgba(99, 102, 241, 0.1);
        }

        .search-section {
          padding: 2rem 5%;
          display: flex;
          gap: 1rem;
        }

        .search-section input {
          flex: 1;
          padding: 0.9rem 1.2rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          font-size: 1rem;
          color: white;
        }

        .search-section input:focus {
          outline: none;
          border-color: #6366F1;
        }

        .search-section button {
          padding: 0.9rem 2rem;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .categories {
          padding: 0 5%;
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }

        .category-btn {
          padding: 0.6rem 1.2rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.3s;
        }

        .category-btn.active {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          border-color: transparent;
        }

        .sort-bar {
          padding: 0 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          color: #94A3B8;
        }

        .sort-bar select {
          padding: 0.5rem 1rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }

        .tasks-grid {
          padding: 0 5%;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .task-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .task-card:hover {
          transform: translateY(-5px);
          border-color: #6366F1;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
        }

        .task-header {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.8rem;
        }

        .task-category {
          background: rgba(99, 102, 241, 0.2);
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-size: 0.8rem;
          color: #818CF8;
        }

        .task-urgent {
          background: linear-gradient(135deg, #F472B6, #FB923C);
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        .task-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.6rem;
          line-height: 1.4;
        }

        .task-desc {
          color: #94A3B8;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .task-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #64748B;
          margin-bottom: 1rem;
        }

        .task-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .task-price {
          font-size: 1.3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #F472B6, #FB923C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .task-bids {
          color: #94A3B8;
          font-size: 0.85rem;
        }

        .loading, .empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem;
          color: #94A3B8;
        }
      `}</style>
    </div>
  );
}

