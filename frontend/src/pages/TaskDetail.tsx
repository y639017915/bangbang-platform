
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { taskAPI, bidAPI } from "../api";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidPrice, setBidPrice] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setCurrentUser(JSON.parse(user));
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await taskAPI.getTask(parseInt(id!));
      setTask(res.data.task);
    } catch (error) {
      console.error("获取任务失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await bidAPI.createBid(parseInt(id!), {
        price: parseFloat(bidPrice),
        message: bidMessage,
      });
      fetchTask();
      setBidPrice("");
      setBidMessage("");
    } catch (err: any) {
      setError(err.response?.data?.error || "投标失败");
    }
  };

  const handleAcceptBid = async (bidId: number) => {
    try {
      await bidAPI.acceptBid(parseInt(id!), bidId);
      fetchTask();
    } catch (err: any) {
      alert(err.response?.data?.error || "操作失败");
    }
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (!task) return <div className="loading">任务不存在</div>;

  const isOwner = currentUser?.id === task.user?.id;
  const hasBidded = task.bids?.some((bid: any) => bid.user?.id === currentUser?.id);

  return (
    <div className="detail-page">
      <nav className="navbar">
        <button onClick={() => navigate("/")} className="back-btn">← 返回</button>
        <h1>任务详情</h1>
        <div></div>
      </nav>

      <div className="content">
        <div className="task-info">
          <div className="task-header">
            <span className="task-category">{task.category}</span>
            {task.urgent && <span className="task-urgent">⚡ 加急</span>}
          </div>
          <h2 className="task-title">{task.title}</h2>
          <div className="task-meta">
            <span>⏰ 截止：{new Date(task.deadline).toLocaleString()}</span>
            <span>📍 {task.location}</span>
            <span>👤 发布者：{task.user?.username}</span>
          </div>
          <div className="task-desc">
            <h3>任务描述</h3>
            <p>{task.description}</p>
          </div>
          <div className="task-price">
            <span>预算</span>
            <strong>¥{task.budget}</strong>
          </div>
        </div>

        <div className="bids-section">
          <h3>投标列表 ({task.bids?.length || 0})</h3>
          {task.bids?.length === 0 ? (
            <div className="no-bids">暂无投标，快来抢单吧！</div>
          ) : (
            <div className="bid-list">
              {task.bids?.map((bid: any) => (
                <div key={bid.id} className={`bid-item ${bid.status}`}>
                  <div className="bidder-info">
                    <div className="bidder-avatar">{bid.user?.username?.[0] || "?"}</div>
                    <div>
                      <div className="bidder-name">{bid.user?.username}</div>
                      <div className="bidder-rating">⭐ {bid.user?.rating || 5.0} · {bid.message}</div>
                    </div>
                  </div>
                  <div className="bid-right">
                    <div className="bid-price">¥{bid.price}</div>
                    {isOwner && bid.status === "pending" && (
                      <button onClick={() => handleAcceptBid(bid.id)} className="accept-btn">
                        接受
                      </button>
                    )}
                    {bid.status === "accepted" && <span className="status-badge accepted">已接受</span>}
                    {bid.status === "rejected" && <span className="status-badge rejected">已拒绝</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isOwner && !hasBidded && currentUser && (
            <form onSubmit={handleBid} className="bid-form">
              <h4>我要投标</h4>
              {error && <div className="error">{error}</div>}
              <input
                type="number"
                placeholder="您的报价"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
                required
              />
              <textarea
                placeholder="自我介绍..."
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
              />
              <button type="submit">提交投标</button>
            </form>
          )}

          {!currentUser && (
            <div className="login-prompt">
              <button onClick={() => navigate("/login")}>登录后投标</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .detail-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0F172A 0%, #1E1B4B 100%);
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

        .back-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 1rem;
          cursor: pointer;
        }

        .navbar h1 {
          font-size: 1.3rem;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .content {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 5%;
        }

        .task-info {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .task-header {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .task-category {
          background: rgba(99, 102, 241, 0.2);
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-size: 0.85rem;
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
          font-size: 1.6rem;
          margin-bottom: 1rem;
        }

        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          color: #94A3B8;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .task-desc h3 {
          color: #94A3B8;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .task-desc p {
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }

        .task-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(244, 114, 182, 0.1);
          border-radius: 12px;
        }

        .task-price span {
          color: #94A3B8;
        }

        .task-price strong {
          font-size: 1.8rem;
          background: linear-gradient(135deg, #F472B6, #FB923C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .bids-section {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
        }

        .bids-section h3 {
          margin-bottom: 1.5rem;
        }

        .no-bids {
          text-align: center;
          padding: 2rem;
          color: #94A3B8;
        }

        .bid-list {
          margin-bottom: 2rem;
        }

        .bid-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-bottom: 0.8rem;
        }

        .bid-item.accepted {
          border-color: #10B981;
          background: rgba(16, 185, 129, 0.1);
        }

        .bidder-info {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .bidder-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .bidder-name {
          font-weight: 600;
        }

        .bidder-rating {
          color: #94A3B8;
          font-size: 0.85rem;
        }

        .bid-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .bid-price {
          font-size: 1.1rem;
          font-weight: 700;
          background: linear-gradient(135deg, #F472B6, #FB923C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .accept-btn {
          padding: 0.5rem 1rem;
          background: #10B981;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .status-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.accepted {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
        }

        .status-badge.rejected {
          background: rgba(239, 68, 68, 0.2);
          color: #EF4444;
        }

        .bid-form {
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .bid-form h4 {
          margin-bottom: 1rem;
        }

        .bid-form input,
        .bid-form textarea {
          width: 100%;
          padding: 0.9rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 1rem;
          color: white;
          margin-bottom: 0.8rem;
          font-family: inherit;
        }

        .bid-form textarea {
          min-height: 80px;
          resize: vertical;
        }

        .bid-form button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .login-prompt {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .login-prompt button {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .error {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
          padding: 0.8rem;
          border-radius: 8px;
          margin-bottom: 1rem;
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

