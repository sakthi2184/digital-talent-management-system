import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Filler
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Title, Filler
);

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const isAdmin = user?.role === "admin";

  const [tasks, setTasks] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, perfRes] = await Promise.all([
        axios.get("http://localhost:5000/api/tasks/all", auth),
        isAdmin ? axios.get("http://localhost:5000/api/auth/admin/performance", auth) : Promise.resolve({ data: [] })
      ]);
      setTasks(tasksRes.data);
      setPerformance(perfRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const pending = tasks.filter(t => t.status === "Pending").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const highP = tasks.filter(t => t.priority === "High").length;
  const medP = tasks.filter(t => t.priority === "Medium").length;
  const lowP = tasks.filter(t => t.priority === "Low").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Overdue tasks
  const today = new Date();
  const overdueTasks = tasks.filter(t =>
    t.deadline && new Date(t.deadline) < today && t.status !== "Completed"
  );

  // Trend data — group tasks by creation date (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const trendData = last7Days.map(day => {
    return tasks.filter(t => {
      const created = new Date(t.createdAt);
      return created.toLocaleDateString("en-US", { month: "short", day: "numeric" }) === day;
    }).length;
  });

  const recentTasks = tasks.slice(-5).reverse();

  const getStatusBadge = (s) => {
    if (s === "Completed") return "badge-status badge-completed";
    if (s === "In Progress") return "badge-status badge-progress";
    return "badge-status badge-pending";
  };

  const getPriorityBadge = (p) => {
    if (p === "High") return "badge-status badge-high";
    if (p === "Low") return "badge-status badge-low";
    return "badge-status badge-medium";
  };

  // Chart configs
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
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "var(--chart-text)", padding: 16, font: { size: 12, family: "Inter" } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} tasks` } }
    },
    cutout: "70%",
  };

  const barData = {
    labels: ["High", "Medium", "Low"],
    datasets: [{
      label: "Tasks",
      data: [highP, medP, lowP],
      backgroundColor: ["rgba(239,68,68,0.8)", "rgba(251,191,36,0.8)", "rgba(34,197,94,0.8)"],
      borderColor: ["#ef4444", "#fbbf24", "#22c55e"],
      borderWidth: 2, borderRadius: 8, borderSkipped: false,
    }]
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "var(--chart-text)", font: { size: 12, family: "Inter" } } },
      y: { beginAtZero: true, ticks: { stepSize: 1, color: "var(--chart-text)", font: { size: 12, family: "Inter" } }, grid: { color: "rgba(100,116,139,0.15)" } }
    }
  };

  const lineData = {
    labels: last7Days,
    datasets: [{
      label: "Tasks Created",
      data: trendData,
      borderColor: "var(--accent)",
      backgroundColor: "rgba(102,126,234,0.1)",
      borderWidth: 2,
      pointBackgroundColor: "var(--accent)",
      pointRadius: 4,
      fill: true,
      tension: 0.4,
    }]
  };

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "var(--chart-text)", font: { size: 11, family: "Inter" } } },
      y: { beginAtZero: true, ticks: { stepSize: 1, color: "var(--chart-text)", font: { size: 11, family: "Inter" } }, grid: { color: "rgba(100,116,139,0.15)" } }
    }
  };

  const exportCSV = () => {
    const headers = ["Title", "Description", "Status", "Priority", "Assigned To", "Submitted By", "Deadline", "Approval Status", "Created At"];
    const rows = tasks.map(t => [
      t.title, t.description, t.status, t.priority,
      t.assignedTo?.name || "", t.submittedBy?.name || "",
      t.deadline ? new Date(t.deadline).toLocaleDateString() : "",
      t.approvalStatus || "Approved",
      new Date(t.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "tasks.csv"; a.click();
    URL.revokeObjectURL(url);
    alert("✅ CSV exported successfully!");
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div className="page-title" style={{ marginBottom: 0 }}>
            Dashboard
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 400, marginLeft: "12px" }}>
              Welcome back, {user?.name} 👋
            </span>
          </div>
          {isAdmin && (
            <button onClick={exportCSV} style={{
              padding: "8px 18px", borderRadius: "10px",
              background: "var(--accent-bg)", border: "1px solid var(--accent)",
              color: "var(--accent)", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s"
            }}>⬇️ Export CSV</button>
          )}
        </div>

        {loading ? (
          <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading...</div>
        ) : (
          <>
            {/* Overdue Alert */}
            {overdueTasks.length > 0 && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "12px", padding: "14px 20px", marginBottom: "20px",
                display: "flex", alignItems: "center", gap: "12px"
              }}>
                <span style={{ fontSize: "20px" }}>🚨</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626" }}>
                    {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {overdueTasks.map(t => t.title).join(", ")}
                  </div>
                </div>
              </div>
            )}

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

            {/* Completion Rate */}
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "14px", padding: "16px 24px", marginBottom: "24px",
              display: "flex", alignItems: "center", gap: "16px", boxShadow: "var(--card-shadow)"
            }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500, whiteSpace: "nowrap" }}>
                Overall Completion Rate
              </div>
              <div style={{ flex: 1, background: "var(--bg-tertiary)", borderRadius: "999px", height: "10px", overflow: "hidden" }}>
                <div style={{
                  width: `${completionRate}%`, height: "100%",
                  background: "linear-gradient(90deg, var(--accent), #22c55e)",
                  borderRadius: "999px", transition: "width 0.8s ease"
                }} />
              </div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent)", minWidth: "48px", textAlign: "right" }}>
                {completionRate}%
              </div>
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div className="form-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
                  📊 Task Status Distribution
                </div>
                <div style={{ position: "relative", height: "220px" }}>
                  {total === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)", fontSize: "13px" }}>No tasks yet</div>
                  ) : (
                    <>
                      <Doughnut data={donutData} options={donutOptions} />
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -60%)", textAlign: "center", pointerEvents: "none" }}>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)" }}>{completionRate}%</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Done</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="form-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
                  🎯 Tasks by Priority
                </div>
                <div style={{ height: "220px" }}>
                  {total === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)", fontSize: "13px" }}>No tasks yet</div>
                  ) : (
                    <Bar data={barData} options={barOptions} />
                  )}
                </div>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="form-card" style={{ padding: "24px", marginBottom: "20px" }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>
                📈 Task Creation Trend — Last 7 Days
              </div>
              <div style={{ height: "180px" }}>
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>

            {/* Status Tracker */}
            <div className="form-card" style={{ padding: "24px", marginBottom: "20px" }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "20px" }}>
                📈 Task Status Tracker
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {[
                  { label: "Pending", count: pending, color: "#fbbf24", bg: "rgba(251,191,36,0.1)", icon: "⏳" },
                  { label: "In Progress", count: inProgress, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: "⚡" },
                  { label: "Completed", count: completed, color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: "✅" },
                ].map(item => (
                  <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.color}30`, borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>{item.icon}</div>
                    <div style={{ fontSize: "32px", fontWeight: 700, color: item.color, marginBottom: "4px" }}>{item.count}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>{item.label}</div>
                    <div style={{ marginTop: "10px", background: "var(--bg-tertiary)", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
                      <div style={{ width: total > 0 ? `${Math.round((item.count / total) * 100)}%` : "0%", height: "100%", background: item.color, borderRadius: "999px", transition: "width 0.8s ease" }} />
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                      {total > 0 ? Math.round((item.count / total) * 100) : 0}% of total
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Performance Table — Admin only */}
            {isAdmin && performance.length > 0 && (
              <div className="form-card" style={{ padding: "0", overflow: "hidden", marginBottom: "20px" }}>
                <div style={{ padding: "20px 24px 16px", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                  👥 User Performance
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["User", "Role", "Total", "Completed", "In Progress", "Pending", "Rate"].map(h => (
                        <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {performance.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: i < performance.length - 1 ? "1px solid var(--border)" : "none" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-tertiary)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "white" }}>
                              {p.name?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <span style={{ padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: p.role === "admin" ? "var(--accent-bg)" : "rgba(34,197,94,0.15)", color: p.role === "admin" ? "var(--accent)" : "#16a34a" }}>
                            {p.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>{p.total}</td>
                        <td style={{ padding: "12px 20px", fontSize: "13px", color: "#22c55e", fontWeight: 600 }}>{p.completed}</td>
                        <td style={{ padding: "12px 20px", fontSize: "13px", color: "#3b82f6", fontWeight: 600 }}>{p.inProgress}</td>
                        <td style={{ padding: "12px 20px", fontSize: "13px", color: "#fbbf24", fontWeight: 600 }}>{p.pending}</td>
                        <td style={{ padding: "12px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ flex: 1, background: "var(--bg-tertiary)", borderRadius: "999px", height: "6px", overflow: "hidden", minWidth: "60px" }}>
                              <div style={{ width: p.total > 0 ? `${Math.round((p.completed / p.total) * 100)}%` : "0%", height: "100%", background: "#22c55e", borderRadius: "999px" }} />
                            </div>
                            <span style={{ fontSize: "12px", color: "var(--text-secondary)", minWidth: "32px" }}>
                              {p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
              {isAdmin && (
                <Link to="/tasks" style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 20px", borderRadius: "10px", textDecoration: "none",
                  background: "var(--accent-bg)", border: "1px solid var(--accent)",
                  color: "var(--accent)", fontSize: "13px", fontWeight: 600, transition: "all 0.2s"
                }}>➕ New Task</Link>
              )}
              <Link to="/tasks" style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 20px", borderRadius: "10px", textDecoration: "none",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                color: "var(--text-primary)", fontSize: "13px", fontWeight: 600, transition: "all 0.2s"
              }}>📋 View All Tasks</Link>
              {isAdmin && (
                <Link to="/admin" style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 20px", borderRadius: "10px", textDecoration: "none",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  color: "var(--text-primary)", fontSize: "13px", fontWeight: 600, transition: "all 0.2s"
                }}>🛡️ Admin Panel</Link>
              )}
            </div>

            {/* Recent Tasks */}
            <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Recent Tasks</div>
              <Link to="/tasks" style={{ fontSize: "13px", color: "var(--accent)", textDecoration: "none" }}>View all →</Link>
            </div>

            {recentTasks.length === 0 ? (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "40px", textAlign: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
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