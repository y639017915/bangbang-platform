import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, taskAPI, bidAPI } from "../api";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"tasks" | "bids">("tasks");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await authAPI.getMe();
      setUser(userRes.data.user);

      const tasksRes = await taskAPI.getTasks();
      const allTasks = tasksRes.data.tasks.filter(
        (task: any) => task.user?.id === userRes.data.user.id
      );
      setMyTasks(allTasks);

      const bidsRes = await bidAPI.getMyBids();
      setMyBids(bidsRes.data.bids);
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="profile-page">
      <nav className="navbar">
        <button onClick={() => navigate("/")} className="back-btn">← 返回</button>
        <h1>个人中心</h1>
        <button onClick={handleLogout} className="logout-btn">退出</button>
      </nav>

      <div className="profile-header">
        <div className="avatar">
          {user?.username?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="user-info">
          <h2>{user?.username}</h2>
          <p>{user?.email}</p>
          <div className="user-stats">
            <span>⭐ {user?.rating || 5.0} 评分</span>
            <span>📋 {myTasks.length} 发布任务</span>
            <span>🤝 {myBids.length} 投标</span>
          </div>
        </div>
      </div>

      {user?.bio && (
        <div className="bio-section">
          <h3>个人简介</h3>
          <p>{user.bio}</p>
        </div>
      )}

      {user?.skills && user.skills.length > 0 && (
        <div className="skills-section">
          <h3>技能标签</h3>
          <div className="skills">
            {user.skills.map((skill: string, index: number) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          我发布的任务
        </button>
        <button
          className={`tab ${activeTab === "bids" ? "active" : ""}`}
          onClick={() => setActiveTab("bids")}
        >
          我的投标
        </button>
      </div>

      <div className="content">
        {activeTab === "tasks" ? (
          myTasks.length === 0 ? (
            <div className="empty">
              <p>还没有发布任务</p>
              <button onClick={() => navigate("/publish")}>发布第一个任务</button>
            </div>
          ) : (
            <div className="list">
              {myTasks.map((task) => (
                <div key={task.id} className="item" onClick={() => navigate(`/task/${task.id}`)}>
                  <div className="item-header">
                    <span className="task-category">{task.category}</span>
                    <span className={`status ${task.status}`}>
                      {task.status === "open" ? "进行中" : task.status === "in_progress" ? "已接单" : "已完成"}
                    </span>
                  </div>
                  <h4>{task.title}</h4>
                  <div className="item-meta">
                    <span>¥{task.budget}</span>
                    <span>{task._count?.bids || 0} 投标</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          myBids.length === 0 ? (
            <div className="empty">
              <p>还没有投标记录</p>
              <button onClick={() => navigate("/")}>去看看任务</button>
            </div>
          ) : (
            <div className="list">
              {myBids.map((bid) => (
                <div key={bid.id} className="item" onClick={() => navigate(`/task/${bid.task?.id}`)}>
                  <div className="item-header">
                    <span className="task-category">{bid.task?.category}</span>
                    <span className={`status ${bid.status}`}>
                      {bid.status === "pending" ? "等待中" : bid.status === "accepted" ? "已接受" : "未通过"}
                    </span>
                  </div>
                  <h4>{bid.task?.title}</h4>
                  <div className="item-meta">
                    <span>我的报价: ¥{bid.price}</span>
                    <span>预算: ¥{bid.task?.budget}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
