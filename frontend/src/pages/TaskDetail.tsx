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
                    {bid.status === "accepted" && <span className="status-badge status-in_progress">已接受</span>}
                    {bid.status === "rejected" && <span className="status-badge status-rejected">已拒绝</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isOwner && !hasBidded && currentUser && (
            <form onSubmit={handleBid} className="bid-form">
              <h4>我要投标</h4>
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
                placeholder="自我介绍..."
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
              />
              <button type="submit" className="submit-bid-btn">提交投标</button>
            </form>
          )}

          {!currentUser && (
            <div className="login-prompt">
              <button onClick={() => navigate("/login")}>登录后投标</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
