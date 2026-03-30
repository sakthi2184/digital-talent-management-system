import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";

export default function Admin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/dashboard"); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([
        axios.get("http://localhost:5000/api/auth/admin/users", auth),
        axios.get("http://localhost:5000/api/tasks/all", auth)
      ]);
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id, newRole) => {
    if (id === user.id) { toast.error("Cannot change your own role"); return; }
    try {
      await axios.put(
        `http://localhost:5000/api/auth/admin/users/${id}/role`,
        { role: newRole }, auth
      );
      toast.success(`Role updated to ${newRole}`);
      loadData();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const adminCount = users.filter(u => u.role === "admin").length;

  return (
    <div style={{ display: "flex" }}>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="main-content">
        <div className="page-title">
          Admin Panel
          <span style={{
            fontSize: "12px", color: "#667eea", fontWeight: 500,
            background: "rgba(102,126,234,0.1)", padding: "3px 10px",
            borderRadius: "20px", marginLeft: "12px"
          }}>
            🛡️ Admin Access
          </span>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", fontSize: "14px" }}>Loading...</div>
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
                <div className="value" style={{ color: "#667eea" }}>{adminCount}</div>
              </div>
              <div className="stat-card">
                <div className="icon">📋</div>
                <div className="label">Total Tasks</div>
                <div className="value">{totalTasks}</div>
              </div>
              <div className="stat-card">
                <div className="icon">✅</div>
                <div className="label">Completed</div>
                <div className="value" style={{ color: "#22c55e" }}>{completedTasks}</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {["users", "tasks"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "8px 20px", borderRadius: "10px", border: "1px solid",
                  fontSize: "13px", fontWeight: 500, cursor: "pointer",
                  transition: "all 0.2s",
                  background: activeTab === tab ? "rgba(102,126,234,0.2)" : "transparent",
                  borderColor: activeTab === tab ? "#667eea" : "rgba(255,255,255,0.1)",
                  color: activeTab === tab ? "#667eea" : "#64748b"
                }}>
                  {tab === "users" ? "👥 Users" : "📋 Tasks"}
                </button>
              ))}
            </div>

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="form-card" style={{ padding: "0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
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
                        borderBottom: i < users.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        transition: "background 0.2s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "32px", height: "32px", borderRadius: "50%",
                              background: "linear-gradient(135deg, #667eea, #764ba2)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "13px", fontWeight: 700, color: "white", flexShrink: 0
                            }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>
                              {u.name}
                              {u._id === user.id && (
                                <span style={{ fontSize: "11px", color: "#667eea", marginLeft: "6px" }}>
                                  (you)
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--text-secondary)" }}>
                          {u.email}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            padding: "3px 12px", borderRadius: "20px",
                            fontSize: "12px", fontWeight: 600,
                            background: u.role === "admin"
                              ? "rgba(102,126,234,0.15)" : "rgba(34,197,94,0.15)",
                            color: u.role === "admin" ? "#667eea" : "#22c55e"
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--text-secondary)" }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          {u._id !== user.id && (
                            <select
                              value={u.role}
                              onChange={e => changeRole(u._id, e.target.value)}
                              style={{
                                background: "var(--input-bg)",
                                border: "1px solid var(--input-border)",
                                borderRadius: "8px",
                                color: "var(--text-primary)",
                                padding: "6px 10px",
                                fontSize: "12px",
                                cursor: "pointer",
                                outline: "none",
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 500
                              }}
                            >
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

            {/* Tasks Tab */}
            {activeTab === "tasks" && (
              <div>
                {tasks.map(task => (
                  <div key={task._id} className="task-card">
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", marginBottom: "8px"
                    }}>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {task.title}
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                        <span className={
                          task.priority === "High" ? "badge-status badge-high" :
                          task.priority === "Low" ? "badge-status badge-low" :
                          "badge-status badge-medium"
                        }>{task.priority}</span>
                        <span className={
                          task.status === "Completed" ? "badge-status badge-completed" :
                          task.status === "In Progress" ? "badge-status badge-progress" :
                          "badge-status badge-pending"
                        }>{task.status}</span>
                      </div>
                    </div>
                    {task.description && (
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                        {task.description}
                      </div>
                    )}
                    <div style={{
                        fontSize: "12px", color: "var(--text-secondary)",
                        display: "flex", gap: "14px"
                      }}>
                      {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                      {task.deadline && (
                        <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}