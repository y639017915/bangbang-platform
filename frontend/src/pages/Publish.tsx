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

      <form onSubmit={handleSubmit} className="publish-form">
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

        <div className="urgent-toggle">
          <label>
            <div
              className={`switch ${formData.urgent ? "active" : ""}`}
              onClick={() => setFormData({ ...formData, urgent: !formData.urgent })}
            />
            <span>⚡ 加急任务（额外收取10%服务费）</span>
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "发布中..." : "发布任务"}
        </button>
      </form>
    </div>
  );
}
