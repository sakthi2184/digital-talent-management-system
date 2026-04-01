import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";

export default function Admin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/dashboard"); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, tasksRes, pendingRes] = await Promise.all([
        axios.get("http://localhost:5000/api/auth/admin/users", auth),
        axios.get("http://localhost:5000/api/tasks/all", auth),
        axios.get("http://localhost:5000/api/tasks/pending-approval", auth)
      ]);
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
      setPendingTasks(pendingRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id, newRole) => {
    if (id === user.id) { toast.error("Cannot change your own role"); return; }
    try {
      await axios.put(`http://localhost:5000/api/auth/admin/users/${id}/role`, { role: newRole }, auth);
      toast.success(`Role updated to ${newRole}`);
      loadData();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const approveTask = async (id, approvalStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/approve/${id}`, { approvalStatus }, auth);
      toast.success(`Task ${approvalStatus === "Approved" ? "approved" : "rejected"}!`);
      loadData();
    } catch {
      toast.error("Failed to update approval");
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const pendingCount = pendingTasks.length;

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

  const tabs = [
    { key: "users", label: "👥 Users" },
    { key: "tasks", label: "📋 Tasks" },
    {
      key: "approvals", label: "⏳ Approvals", badge: pendingCount > 0 ? pendingCount : null
    },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="page-title">
          Admin Panel
          <span style={{
            fontSize: "12px", color: "var(--accent)", fontWeight: 500,
            background: "var(--accent-bg)", padding: "3px 10px",
            borderRadius: "20px", marginLeft: "12px"
          }}>🛡️ Admin Access</span>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading...</div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="stats-grid" style={{ marginBottom: "28px" }}>
              <div className="stat-card">
                <div className="icon">👥</div>
                <div className="label">Total Users</div>
                <div className="value">{users.length}</div>
              </div>
              <div className="stat-card">
                <div className="icon">🛡️</div>
                <div className="label">Admins</div>
                <div className="value" style={{ color: "var(--accent)" }}>{adminCount}</div>
              </div>
              <div className="stat-card">
                <div className="icon">📋</div>
                <div className="label">Total Tasks</div>
                <div className="value">{totalTasks}</div>
              </div>
              <div className="stat-card">
                <div className="icon">⏳</div>
                <div className="label">Pending Approval</div>
                <div className="value" style={{ color: "#d97706" }}>{pendingCount}</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  padding: "8px 20px", borderRadius: "10px", border: "1px solid",
                  fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                  background: activeTab === tab.key ? "var(--accent-bg)" : "transparent",
                  borderColor: activeTab === tab.key ? "var(--accent)" : "var(--border)",
                  color: activeTab === tab.key ? "var(--accent)" : "var(--text-secondary)",
                  display: "flex", alignItems: "center", gap: "6px"
                }}>
                  {tab.label}
                  {tab.badge && (
                    <span style={{
                      background: "#d97706", color: "white",
                      borderRadius: "50%", width: "18px", height: "18px",
                      fontSize: "11px", display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 700
                    }}>{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>

            {/* USERS TAB */}
            {activeTab === "users" && (
              <div className="form-card" style={{ padding: "0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["User", "Email", "Role", "Joined", "Action"].map(h => (
                        <th key={h} style={{
                          padding: "14px 20px", textAlign: "left",
                          fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u._id} style={{
                        borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none",
                        transition: "background 0.2s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-tertiary)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "32px", height: "32px", borderRadius: "50%",
                              background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "13px", fontWeight: 700, color: "white", flexShrink: 0
                            }}>{u.name?.charAt(0).toUpperCase()}</div>
                            <span style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>
                              {u.name}
                              {u._id === user.id && (
                                <span style={{ fontSize: "11px", color: "var(--accent)", marginLeft: "6px" }}>(you)</span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--text-secondary)" }}>
                          {u.email}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                            background: u.role === "admin" ? "var(--accent-bg)" : "rgba(34,197,94,0.15)",
                            color: u.role === "admin" ? "var(--accent)" : "#16a34a"
                          }}>{u.role}</span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--text-secondary)" }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          {u._id !== user.id && (
                            <select value={u.role} onChange={e => changeRole(u._id, e.target.value)}
                              style={{
                                background: "var(--input-bg)", border: "1px solid var(--input-border)",
                                borderRadius: "8px", color: "var(--text-primary)",
                                padding: "6px 10px", fontSize: "12px",
                                cursor: "pointer", outline: "none", fontFamily: "Inter, sans-serif", fontWeight: 500
                              }}>
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TASKS TAB */}
            {activeTab === "tasks" && (
              <div>
                {tasks.map(task => (
                  <div key={task._id} className="task-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {task.title}
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                        <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
                        <span className={getStatusBadge(task.status)}>{task.status}</span>
                      </div>
                    </div>
                    {task.description && (
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                        {task.description}
                      </div>
                    )}
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", gap: "14px" }}>
                      {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                      {task.submittedBy && <span>📝 {task.submittedBy.name}</span>}
                      {task.deadline && <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* APPROVALS TAB */}
            {activeTab === "approvals" && (
              <div>
                {pendingTasks.length === 0 ? (
                  <div style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "14px", padding: "40px", textAlign: "center",
                    color: "var(--text-secondary)", fontSize: "14px"
                  }}>
                    🎉 No pending approvals — all caught up!
                  </div>
                ) : (
                  pendingTasks.map(task => (
                    <div key={task._id} className="task-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {task.title}
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
                          <span style={{
                            padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
                            fontWeight: 600, background: "rgba(251,191,36,0.12)", color: "#d97706"
                          }}>⏳ Pending Approval</span>
                        </div>
                      </div>

                      {task.description && (
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                          {task.description}
                        </div>
                      )}

                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px", display: "flex", gap: "14px" }}>
                        {task.submittedBy && <span>📝 Submitted by <strong>{task.submittedBy.name}</strong></span>}
                        {task.deadline && <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>}
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => approveTask(task._id, "Approved")}
                          style={{
                            padding: "8px 20px", borderRadius: "8px", border: "none",
                            background: "rgba(34,197,94,0.15)", color: "#16a34a",
                            fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                          }}
                          onMouseEnter={e => e.target.style.background = "rgba(34,197,94,0.25)"}
                          onMouseLeave={e => e.target.style.background = "rgba(34,197,94,0.15)"}
                        >✅ Approve</button>
                        <button onClick={() => approveTask(task._id, "Rejected")}
                          style={{
                            padding: "8px 20px", borderRadius: "8px", border: "none",
                            background: "rgba(239,68,68,0.15)", color: "#dc2626",
                            fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                          }}
                          onMouseEnter={e => e.target.style.background = "rgba(239,68,68,0.25)"}
                          onMouseLeave={e => e.target.style.background = "rgba(239,68,68,0.15)"}
                        >❌ Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}