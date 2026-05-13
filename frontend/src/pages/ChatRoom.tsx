import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ChatRoom() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>({ username: "对方用户" });
  const [task, setTask] = useState<any>({ title: "相关任务" });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setCurrentUser(JSON.parse(user));
    loadMockData();
  }, [taskId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMockData = () => {
    const mockMessages = [
      {
        id: 1,
        senderId: 2,
        content: "你好，我看到你发布的任务，请问可以接单吗？",
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        id: 2,
        senderId: 1,
        content: "可以的，请问你有相关经验吗？",
        createdAt: new Date(Date.now() - 1000 * 60 * 45),
      },
      {
        id: 3,
        senderId: 2,
        content: "有的，我之前做过类似的搬家工作，可以保证服务质量",
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: 4,
        senderId: 2,
        content: "价格方面可以再商量吗？",
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
      },
    ];
    setMessages(mockMessages);
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const msg = {
      id: messages.length + 1,
      senderId: 1,
      content: newMessage,
      createdAt: new Date(),
    };

    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "今天";
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "昨天";
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="chatroom-page">
      <nav className="chat-navbar">
        <button onClick={() => navigate(-1)} className="back-btn">←</button>
        <div className="chat-user-info">
          <span className="chat-username">{otherUser.username}</span>
          <span className="chat-task-title">任务：{task.title}</span>
        </div>
        <button onClick={() => navigate(`/task/${taskId}`)} className="task-btn">任务详情</button>
      </nav>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === 1;
          const showDate = index === 0 || 
            messages[index - 1].createdAt.toDateString() !== msg.createdAt.toDateString();

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="date-divider">
                  <span>{formatDate(msg.createdAt)}</span>
                </div>
              )}
              <div className={`message ${isMe ? 'message-me' : 'message-other'}`}>
                {!isMe && (
                  <div className="msg-avatar">
                    {otherUser.username[0].toUpperCase()}
                  </div>
                )}
                <div className="message-content">
                  <div className="bubble">{msg.content}</div>
                  <div className="message-time">{formatTime(msg.createdAt)}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="输入消息..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="send-btn">发送</button>
      </div>

      <style>{`
        .chatroom-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #0F172A 0%, #1E1B4B 100%);
        }

        .chat-navbar {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          padding: 1rem 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          flex-shrink: 0;
        }

        .back-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .chat-user-info {
          text-align: center;
        }

        .chat-username {
          display: block;
          font-weight: 600;
          font-size: 1rem;
        }

        .chat-task-title {
          color: #818CF8;
          font-size: 0.75rem;
        }

        .task-btn {
          padding: 0.5rem 1rem;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.5);
          color: #818CF8;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 5%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .date-divider {
          text-align: center;
          padding: 1rem 0;
        }

        .date-divider span {
          background: rgba(99, 102, 241, 0.2);
          color: #818CF8;
          padding: 0.3rem 1rem;
          border-radius: 50px;
          font-size: 0.8rem;
        }

        .message {
          display: flex;
          gap: 0.8rem;
          margin-bottom: 0.5rem;
        }

        .message-me {
          flex-direction: row-reverse;
        }

        .msg-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .message-content {
          max-width: 70%;
        }

        .bubble {
          padding: 0.8rem 1rem;
          border-radius: 16px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .message-me .bubble {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-other .bubble {
          background: rgba(30, 41, 59, 0.8);
          color: white;
          border-bottom-left-radius: 4px;
        }

        .message-time {
          font-size: 0.7rem;
          color: #64748B;
          margin-top: 0.3rem;
        }

        .message-me .message-time {
          text-align: right;
        }

        .chat-input-area {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          padding: 1rem 5%;
          display: flex;
          gap: 0.8rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          flex-shrink: 0;
        }

        .chat-input-area input {
          flex: 1;
          padding: 0.8rem 1.2rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          font-size: 1rem;
          color: white;
        }

        .chat-input-area input:focus {
          outline: none;
          border-color: #6366F1;
        }

        .chat-input-area input::placeholder {
          color: #64748B;
        }

        .send-btn {
          padding: 0.8rem 1.5rem;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          border: none;
          border-radius: 24px;
          font-weight: 600;
          cursor: pointer;
        }

        .send-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
