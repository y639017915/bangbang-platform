import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockConversations = [
      {
        id: 1,
        taskId: 1,
        taskTitle: "需要搬家帮手",
        otherUser: { username: "张三", avatar: null },
        lastMessage: "好的，我明天下午2点可以到",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
        unreadCount: 2,
      },
      {
        id: 2,
        taskId: 2,
        taskTitle: "电脑维修",
        otherUser: { username: "李四", avatar: null },
        lastMessage: "请问是什么问题？",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
        unreadCount: 0,
      },
      {
        id: 3,
        taskId: 3,
        taskTitle: "家教辅导",
        otherUser: { username: "王五", avatar: null },
        lastMessage: "价格可以再商量吗？",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
        unreadCount: 0,
      },
    ];
    setConversations(mockConversations);
    setLoading(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="messages-page">
      <nav className="navbar">
        <button onClick={() => navigate("/")} className="back-btn">← 返回</button>
        <h1>消息中心</h1>
        <div></div>
      </nav>

      <div className="messages-list">
        {conversations.length === 0 ? (
          <div className="empty-messages">
            <div className="empty-icon">💬</div>
            <p>暂无消息</p>
            <Link to="/" className="browse-tasks-btn">去逛逛任务</Link>
          </div>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id} className="conversation-item" onClick={() => navigate(`/chat/${conv.taskId}`)}>
              <div className="avatar">
                {conv.otherUser.username[0].toUpperCase()}
              </div>
              <div className="conv-content">
                <div className="conv-header">
                  <span className="conv-name">{conv.otherUser.username}</span>
                  <span className="conv-time">{formatTime(conv.lastMessageTime)}</span>
                </div>
                <div className="conv-task">{conv.taskTitle}</div>
                <div className="conv-message">{conv.lastMessage}</div>
              </div>
              {conv.unreadCount > 0 && (
                <div className="unread-badge">{conv.unreadCount}</div>
              )}
            </div>
          ))
        )}
      </div>

      <style>{`
        .messages-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0F172A 0%, #1E1B4B 100%);
          padding-bottom: 3rem;
        }

        .messages-list {
          padding: 1rem 5%;
        }

        .empty-messages {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-messages p {
          color: #94A3B8;
          margin-bottom: 1.5rem;
        }

        .browse-tasks-btn {
          display: inline-block;
          padding: 0.8rem 2rem;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
        }

        .conversation-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          margin-bottom: 0.8rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .conversation-item:hover {
          border-color: #6366F1;
          transform: translateX(5px);
        }

        .avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .conv-content {
          flex: 1;
          min-width: 0;
        }

        .conv-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.3rem;
        }

        .conv-name {
          font-weight: 600;
        }

        .conv-time {
          color: #64748B;
          font-size: 0.8rem;
        }

        .conv-task {
          color: #818CF8;
          font-size: 0.85rem;
          margin-bottom: 0.3rem;
        }

        .conv-message {
          color: #94A3B8;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .unread-badge {
          background: #EF4444;
          color: white;
          font-size: 0.75rem;
          font-weight: bold;
          padding: 0.2rem 0.5rem;
          border-radius: 50px;
          min-width: 20px;
          text-align: center;
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
