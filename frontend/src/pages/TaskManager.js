import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../ThemeContext";

export default function TaskManager() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAdmin = user?.role === "admin";

  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({
    title: "", description: "", assignedTo: "",
    priority: "Medium", status: "Pending", deadline: ""
  });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadTasks();
    axios.get("http://localhost:5000/api/auth/users", auth)
      .then(res => setUsers(res.data))
      .catch(() => toast.error("Failed to load users"));
  }, []);

  const loadTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks/all", auth);
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", assignedTo: "", priority: "Medium", status: "Pending", deadline: "" });
    setEditId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error("Title is required"); return; }
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/tasks/update/${editId}`, form, auth);
        toast.success("Task updated!");
      } else {
        await axios.post("http://localhost:5000/api/tasks/add", form, auth);
        toast.success("Task created!");
      }
      resetForm();
      loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/delete/${id}`, auth);
      toast.success("Task deleted");
      loadTasks();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleStatus = async (task) => {
    const next = task.status === "Pending"
      ? "In Progress" : task.status === "In Progress"
      ? "Completed" : "Pending";
    try {
      await axios.put(`http://localhost:5000/api/tasks/update/${task._id}`, { status: next }, auth);
      toast.success(`Status → ${next}`);
      loadTasks();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const startEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo?._id || "",
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? task.deadline.slice(0, 10) : ""
    });
    setEditId(task._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const logout = () => { localStorage.clear(); navigate("/login"); };

  const filteredTasks = filter === "All" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div style={{ display: "flex" }}>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">Talent<span>MS</span></div>
        <nav style={{ flex: 1 }}>
          <Link to="/dashboard" className="nav-item active">
            <span>📊</span> Dashboard
          </Link>
          <Link to="/tasks" className="nav-item">
            <span>✅</span> Tasks
          </Link>
          <Link to="/profile" className="nav-item">
            <span>👤</span> Profile
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="nav-item">
              <span>🛡️</span> Admin
            </Link>
          )}
        </nav>
        <div style={{ marginTop: "auto" }}>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            <span>{theme === "dark" ? "☀️" : "🌙"}</span>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="page-title">Task Manager</div>

        {/* Form — admin only */}
        {isAdmin && (
          <div className="form-card">
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "18px" }}>
              {editId ? "✏️ Edit Task" : "➕ New Task"}
            </div>
            <form onSubmit={submit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <input
                  className="input-custom"
                  placeholder="Task Title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
                <input
                  className="input-custom"
                  placeholder="Description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
                <select className="select-custom" value={form.assignedTo}
                  onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">Assign to User</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
                <select className="select-custom" value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="Low">🟢 Low Priority</option>
                  <option value="Medium">🟡 Medium Priority</option>
                  <option value="High">🔴 High Priority</option>
                </select>
                <select className="select-custom" value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <input
                  type="date"
                  className="input-custom"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="submit" className="btn-primary-custom"
                  style={{ width: "auto", padding: "10px 28px" }}>
                  {editId ? "Update Task" : "Add Task"}
                </button>
                {editId && (
                  <button type="button" onClick={resetForm} style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#94a3b8", padding: "10px 20px",
                    borderRadius: "10px", cursor: "pointer", fontSize: "14px"
                  }}>Cancel</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {["All", "Pending", "In Progress", "Completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 16px", borderRadius: "20px", border: "1px solid",
              fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
              background: filter === f ? "rgba(102,126,234,0.2)" : "transparent",
              borderColor: filter === f ? "#667eea" : "rgba(255,255,255,0.1)",
              color: filter === f ? "#667eea" : "#64748b"
            }}>{f}</button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "13px", color: "#64748b", alignSelf: "center" }}>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Task List */}
        {loading ? (
          <div style={{ color: "#64748b", fontSize: "14px" }}>Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div style={{
            background: "#13161f", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px", padding: "40px", textAlign: "center",
            color: "#64748b", fontSize: "14px"
          }}>No tasks found for this filter.</div>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className="task-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>{task.title}</div>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
                  <span className={getStatusBadge(task.status)}>{task.status}</span>
                </div>
              </div>
              {task.description && (
                <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px" }}>
                  {task.description}
                </div>
              )}
              <div style={{ fontSize: "12px", color: "#475569", marginBottom: "14px", display: "flex", gap: "14px" }}>
                {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                {task.deadline && <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {isAdmin && (
                  <>
                    <button className="btn-sm-custom btn-toggle" onClick={() => toggleStatus(task)}>⟳ Status</button>
                    <button className="btn-sm-custom btn-edit" onClick={() => startEdit(task)}>✏️ Edit</button>
                    <button className="btn-sm-custom btn-delete" onClick={() => deleteTask(task._id)}>🗑 Delete</button>
                  </>
                )}
                {!isAdmin && (
                  <span style={{ fontSize: "12px", color: "#475569" }}>
                    👁 View only — contact admin to make changes
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}