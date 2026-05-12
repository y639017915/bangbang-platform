
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { taskAPI } from "../api";

export default function Publish() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    deadline: "",
    location: "",
    urgent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await taskAPI.createTask({
        ...formData,
        budget: parseFloat(formData.budget),
      });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "发布失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "体力劳动", label: "💪 体力劳动", desc: "搬家、维修、清洁等" },
    { value: "专业技能", label: "💻 专业技能", desc: "设计、编程、写作等" },
    { value: "教育培训", label: "📚 教育培训", desc: "家教、咨询、培训等" },
    { value: "生活服务", label: "🏠 生活服务", desc: "陪诊、宠物、照顾等" },
    { value: "商业项目", label: "💼 商业项目", desc: "调研、策划、外包等" },
  ];

  return (
    <div className="publish-page">
      <nav className="navbar">
        <button onClick={() => navigate("/")} className="back-btn">← 返回</button>
        <h1>发布任务</h1>
        <div></div>
      </nav>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>任务标题 *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="简明扼要地描述任务"
            required
          />
        </div>

        <div className="form-group">
          <label>任务分类 *</label>
          <div className="category-grid">
            {categories.map((cat) => (
              <div
                key={cat.value}
                className={`category-option ${formData.category === cat.value ? "selected" : ""}`}
                onClick={() => setFormData({ ...formData, category: cat.value })}
              >
                <div className="cat-icon">{cat.label}</div>
                <div className="cat-desc">{cat.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>预算金额 *</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="¥"
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>截止时间 *</label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>任务地点 *</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="如：北京市朝阳区"
            required
          />
        </div>

        <div className="form-group">
          <label>任务描述 *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="详细描述任务要求，让接单者更清楚您的需求..."
            required
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.urgent}
              onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
            />
            <span>⚡ 加急任务（额外收取10%服务费）</span>
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "发布中..." : "发布任务"}
        </button>
      </form>

      <style>{`
        .publish-page {
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
          padding: 0.5rem;
        }

        .navbar h1 {
          font-size: 1.3rem;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .form-container {
          max-width: 700px;
          margin: 2rem auto;
          padding: 0 5%;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.6rem;
          color: #E2E8F0;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.9rem 1rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 1rem;
          color: white;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #6366F1;
        }

        .form-group textarea {
          min-height: 120px;
          resize: vertical;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }

        .category-option {
          background: rgba(30, 41, 59, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.2rem;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .category-option:hover {
          border-color: rgba(99, 102, 241, 0.5);
        }

        .category-option.selected {
          border-color: #6366F1;
          background: rgba(99, 102, 241, 0.15);
        }

        .cat-icon {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }

        .cat-desc {
          font-size: 0.85rem;
          color: #94A3B8;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          cursor: pointer;
        }

        .checkbox-label input {
          width: 20px;
          height: 20px;
          accent-color: #6366F1;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #EF4444;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
        }

        .btn-submit {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

