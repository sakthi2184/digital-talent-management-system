import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    axios.get("http://localhost:5000/api/tasks/all", auth)
      .then(res => { setTasks(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const pending = tasks.filter(t => t.status === "Pending").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const highPriority = tasks.filter(t => t.priority === "High").length;


  const recentTasks = tasks.slice(-5).reverse();

  const getStatusBadge = (status) => {
    if (status === "Completed") return "badge-status badge-completed";
    if (status === "In Progress") return "badge-status badge-progress";
    return "badge-status badge-pending";
  };

  const getPriorityBadge = (priority) => {
    if (priority === "High") return "badge-status badge-high";
    if (priority === "Low") return "badge-status badge-low";
    return "badge-status badge-medium";
  };

  return (
    <div style={{ display: "flex" }}>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="main-content">
        <div className="page-title">
          Dashboard
          <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 400, marginLeft: "12px" }}>
            Welcome back, {user?.name} 👋
          </span>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div style={{ color: "#64748b", fontSize: "14px" }}>Loading...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="icon">📋</div>
                <div className="label">Total Tasks</div>
                <div className="value">{total}</div>
              </div>
              <div className="stat-card">
                <div className="icon">✅</div>
                <div className="label">Completed</div>
                <div className="value" style={{ color: "#22c55e" }}>{completed}</div>
              </div>
              <div className="stat-card">
                <div className="icon">⏳</div>
                <div className="label">Pending</div>
                <div className="value" style={{ color: "#fbbf24" }}>{pending}</div>
              </div>
              <div className="stat-card">
                <div className="icon">🔥</div>
                <div className="label">High Priority</div>
                <div className="value" style={{ color: "#ef4444" }}>{highPriority}</div>
              </div>
            </div>

            {/* In Progress Banner */}
            {inProgress > 0 && (
              <div style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "12px",
                padding: "14px 20px",
                marginBottom: "24px",
                fontSize: "14px",
                color: "#3b82f6",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span>⚡</span>
                <span><strong>{inProgress}</strong> task{inProgress > 1 ? "s are" : " is"} currently in progress</span>
              </div>
            )}

            {/* Recent Tasks */}
            <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Recent Tasks</div>
              <Link to="/tasks" style={{ fontSize: "13px", color: "#667eea", textDecoration: "none" }}>
                View all →
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div style={{
                background: "#13161f",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "14px",
                padding: "40px",
                textAlign: "center",
                color: "#64748b",
                fontSize: "14px"
              }}>
                No tasks yet. <Link to="/tasks" className="auth-link">Create your first task →</Link>
              </div>
            ) : (
              recentTasks.map(task => (
                <div key={task._id} className="task-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                   <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{task.title}</div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
                      <span className={getStatusBadge(task.status)}>{task.status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>{task.description}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {task.assignedTo ? `👤 ${task.assignedTo.name}` : "Unassigned"}
                    {task.deadline && ` · 📅 ${new Date(task.deadline).toLocaleDateString()}`}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}