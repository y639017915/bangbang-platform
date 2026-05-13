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
      <nav className="navbar">
        <h1 className="logo">帮帮<span>.</span></h1>
        <div className="nav-right">
          {currentUser ? (
            <>
              <Link to="/messages" className="nav-icon-btn" title="消息">💬</Link>
              <Link to="/publish" className="btn btn-primary">发布任务</Link>
              <Link to="/profile" className="btn btn-outline">个人中心</Link>
              <button onClick={handleLogout} className="btn btn-outline">退出</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">登录/注册</Link>
          )}
        </div>
      </nav>

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

      <div className="sort-bar">
        <span>共 {tasks.length} 个任务</span>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">最新发布</option>
          <option value="price-high">价格最高</option>
          <option value="price-low">价格最低</option>
        </select>
      </div>

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
    </div>
  );
}
