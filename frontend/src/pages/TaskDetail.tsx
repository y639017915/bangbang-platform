import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
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
  const myBid = task.bids?.find((bid: any) => bid.user?.id === currentUser?.id);

  return (
    <div className="task-detail-page">
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
            <span className={`status-badge status-${task.status}`}>
              {task.status === "open" ? "🔥 进行中" : task.status === "in_progress" ? "🔄 已接单" : "✅ 已完成"}
            </span>
          </div>
          <h2 className="task-title">{task.title}</h2>
          <div className="task-meta">
            <span>⏰ 截止：{new Date(task.deadline).toLocaleString()}</span>
            <span>📍 {task.location}</span>
            <span>👤 发布者：{task.user?.username}</span>
          </div>
          <div className="detail-content">
            <h2>任务描述</h2>
            <p>{task.description}</p>
          </div>
          <div className="task-price">
            <span>预算</span>
            <strong>¥{task.budget}</strong>
          </div>
        </div>

        {myBid && (
          <div className="action-card">
            <div className="action-header">
              <span>您的投标</span>
              <span className={`bid-status status-${myBid.status}`}>
                {myBid.status === "pending" ? "⏳ 等待中" : myBid.status === "accepted" ? "✅ 已接受" : "❌ 未通过"}
              </span>
            </div>
            <div className="action-info">
              <span>您的报价：<strong>¥{myBid.price}</strong></span>
              {myBid.status === "accepted" && (
                <Link to={`/chat/${id}`} className="contact-btn">💬 联系对方</Link>
              )}
            </div>
          </div>
        )}

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
                      <div className="bidder-rating">⭐ {bid.user?.rating || 5.0}</div>
                    </div>
                  </div>
                  <div className="bid-middle">
                    <div className="bid-message">{bid.message || "无留言"}</div>
                  </div>
                  <div className="bid-right">
                    <div className="bid-price">¥{bid.price}</div>
                    {isOwner && bid.status === "pending" && (
                      <button onClick={() => handleAcceptBid(bid.id)} className="accept-btn">
                        接受投标
                      </button>
                    )}
                    {isOwner && bid.status === "accepted" && (
                      <Link to={`/chat/${id}`} className="contact-btn-small">💬 聊天</Link>
                    )}
                    {bid.status === "accepted" && !isOwner && (
                      <span className="status-badge status-in_progress">已接受</span>
                    )}
                    {bid.status === "rejected" && (
                      <span className="status-badge status-rejected">已拒绝</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isOwner && !myBid && currentUser && (
            <form onSubmit={handleBid} className="bid-form">
              <h4>🚀 我要接单 / 投标</h4>
              {error && <div className="error-message">{error}</div>}
              <div className="price-input">
                <span>¥</span>
                <input
                  type="number"
                  placeholder="您的报价"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  required
                />
              </div>
              <textarea
                placeholder="介绍一下您的优势和相关经验，让发布者更了解您..."
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
              />
              <button type="submit" className="submit-bid-btn">提交投标</button>
            </form>
          )}

          {!currentUser && (
            <div className="login-prompt">
              <button onClick={() => navigate("/login")}>登录后投标/接单</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .status-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-open {
          background: rgba(245, 158, 11, 0.2);
          color: #F59E0B;
        }

        .status-in_progress {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
        }

        .status-completed {
          background: rgba(16, 185, 129, 0.3);
          color: #10B981;
        }

        .status-pending {
          background: rgba(245, 158, 11, 0.2);
          color: #F59E0B;
        }

        .status-accepted {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
        }

        .status-rejected {
          background: rgba(239, 68, 68, 0.2);
          color: #EF4444;
        }

        .action-card {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 16px;
          padding: 1.2rem;
          margin-bottom: 1.5rem;
        }

        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
        }

        .action-header span:first-child {
          font-weight: 600;
        }

        .action-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .action-info strong {
          color: #F472B6;
          font-size: 1.2rem;
        }

        .contact-btn {
          padding: 0.6rem 1.2rem;
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .contact-btn-small {
          padding: 0.4rem 0.8rem;
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
          text-decoration: none;
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .bid-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-bottom: 0.8rem;
        }

        .bid-item.accepted {
          border-color: #10B981;
          background: rgba(16, 185, 129, 0.05);
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

        .bid-middle {
          flex: 1;
        }

        .bid-message {
          color: #94A3B8;
          font-size: 0.85rem;
        }

        .bid-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
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
          font-size: 0.85rem;
        }

        .bid-form {
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .bid-form h4 {
          margin-bottom: 1rem;
        }

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
          min-height: 80px;
          resize: vertical;
        }

        .bid-status {
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
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
      `}</style>
    </div>
  );
}
