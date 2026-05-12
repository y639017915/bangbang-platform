
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

      <style>{`
        .profile-page {
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
        }

        .back-btn, .logout-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .navbar h1 {
          font-size: 1.3rem;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .profile-header {
          padding: 2rem 5%;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
        }

        .user-info h2 {
          margin-bottom: 0.3rem;
        }

        .user-info p {
          color: #94A3B8;
          font-size: 0.9rem;
          margin-bottom: 0.8rem;
        }

        .user-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #94A3B8;
        }

        .bio-section, .skills-section {
          padding: 0 5%;
          margin-bottom: 1.5rem;
        }

        .bio-section h3, .skills-section h3 {
          font-size: 0.9rem;
          color: #94A3B8;
          margin-bottom: 0.5rem;
        }

        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          background: rgba(99, 102, 241, 0.2);
          padding: 0.4rem 0.8rem;
          border-radius: 50px;
          font-size: 0.85rem;
          color: #818CF8;
        }

        .tabs {
          padding: 0 5%;
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .tab {
          padding: 0.8rem 1.5rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tab.active {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          border-color: transparent;
        }

        .content {
          padding: 0 5%;
        }

        .empty {
          text-align: center;
          padding: 3rem;
          color: #94A3B8;
        }

        .empty button {
          margin-top: 1rem;
          padding: 0.8rem 1.5rem;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .item {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.2rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .item:hover {
          border-color: #6366F1;
          transform: translateY(-2px);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
        }

        .task-category {
          background: rgba(99, 102, 241, 0.2);
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-size: 0.8rem;
          color: #818CF8;
        }

        .status {
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status.open, .status.pending {
          background: rgba(245, 158, 11, 0.2);
          color: #F59E0B;
        }

        .status.in_progress, .status.accepted {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
        }

        .status.rejected {
          background: rgba(239, 68, 68, 0.2);
          color: #EF4444;
        }

        .item h4 {
          margin-bottom: 0.5rem;
        }

        .item-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #94A3B8;
        }

        .loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94A3B8;
        }
      `}</style>
    </div>
  );
}

