import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    axios.get("http://localhost:5000/api/tasks/all", auth)
      .then(res => { setTasks(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const total      = tasks.length;
  const completed  = tasks.filter(t => t.status === "Completed").length;
  const pending    = tasks.filter(t => t.status === "Pending").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const highP      = tasks.filter(t => t.priority === "High").length;
  const medP       = tasks.filter(t => t.priority === "Medium").length;
  const lowP       = tasks.filter(t => t.priority === "Low").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

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

  // Donut chart — completion rate
  const donutData = {
    labels: ["Completed", "In Progress", "Pending"],
    datasets: [{
      data: [completed, inProgress, pending],
      backgroundColor: ["#22c55e", "#3b82f6", "#fbbf24"],
      borderColor: ["#16a34a", "#2563eb", "#d97706"],
      borderWidth: 2,
    }]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "var(--chart-text)",
          padding: 16,
          font: { size: 12, family: "Inter" }
        }
      },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} tasks` } }
    },
    cutout: "70%",
  };

  // Bar chart — tasks by priority
  const barData = {
    labels: ["High", "Medium", "Low"],
    datasets: [{
      label: "Tasks",
      data: [highP, medP, lowP],
      backgroundColor: ["rgba(239,68,68,0.8)", "rgba(251,191,36,0.8)", "rgba(34,197,94,0.8)"],
      borderColor: ["#ef4444", "#fbbf24", "#22c55e"],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.raw} tasks` } }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "var(--chart-text)", font: { size: 12, family: "Inter" } }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: "var(--chart-text)", font: { size: 12, family: "Inter" } },
        grid: { color: "rgba(100,116,139,0.15)" }
      }
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">

        {/* Page Title */}
        <div className="page-title">
          Dashboard
          <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 400, marginLeft: "12px" }}>
            Welcome back, {user?.name} 👋
          </span>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading...</div>
        ) : (
          <>
            {/* Stat Cards */}
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
                <div className="value" style={{ color: "#ef4444" }}>{highP}</div>
              </div>
            </div>

            {/* Completion Rate Banner */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "16px 24px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "var(--card-shadow)"
            }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
                Overall Completion Rate
              </div>
              <div style={{ flex: 1, background: "var(--bg-tertiary)", borderRadius: "999px", height: "10px", overflow: "hidden" }}>
                <div style={{
                  width: `${completionRate}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, var(--accent), #22c55e)",
                  borderRadius: "999px",
                  transition: "width 0.8s ease"
                }} />
              </div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent)", minWidth: "48px", textAlign: "right" }}>
                {completionRate}%
              </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>

              {/* Donut Chart */}
              <div className="form-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
                  📊 Task Status Distribution
                </div>
                <div style={{ position: "relative", height: "220px" }}>
                  {total === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)", fontSize: "13px" }}>
                      No tasks yet
                    </div>
                  ) : (
                    <>
                      <Doughnut data={donutData} options={donutOptions} />
                      <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -60%)",
                        textAlign: "center", pointerEvents: "none"
                      }}>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)" }}>{completionRate}%</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Done</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="form-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
                  🎯 Tasks by Priority
                </div>
                <div style={{ height: "220px" }}>
                  {total === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)", fontSize: "13px" }}>
                      No tasks yet
                    </div>
                  ) : (
                    <Bar data={barData} options={barOptions} />
                  )}
                </div>
              </div>
            </div>

            {/* Status Tracker */}
            <div className="form-card" style={{ padding: "24px", marginBottom: "28px" }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "20px" }}>
                📈 Task Status Tracker
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {[
                  { label: "Pending", count: pending, color: "#fbbf24", bg: "rgba(251,191,36,0.1)", icon: "⏳" },
                  { label: "In Progress", count: inProgress, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: "⚡" },
                  { label: "Completed", count: completed, color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: "✅" },
                ].map(item => (
                  <div key={item.label} style={{
                    background: item.bg,
                    border: `1px solid ${item.color}30`,
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>{item.icon}</div>
                    <div style={{ fontSize: "32px", fontWeight: 700, color: item.color, marginBottom: "4px" }}>
                      {item.count}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                      {item.label}
                    </div>
                    <div style={{ marginTop: "10px", background: "var(--bg-tertiary)", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
                      <div style={{
                        width: total > 0 ? `${Math.round((item.count / total) * 100)}%` : "0%",
                        height: "100%",
                        background: item.color,
                        borderRadius: "999px",
                        transition: "width 0.8s ease"
                      }} />
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                      {total > 0 ? Math.round((item.count / total) * 100) : 0}% of total
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Tasks */}
            <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Recent Tasks</div>
              <Link to="/tasks" style={{ fontSize: "13px", color: "var(--accent)", textDecoration: "none" }}>
                View all →
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "40px", textAlign: "center",
                color: "var(--text-secondary)", fontSize: "14px"
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