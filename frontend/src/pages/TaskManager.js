import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";

export default function TaskManager() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAdmin = user?.role === "admin";
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expandedLog, setExpandedLog] = useState(null);

  const [form, setForm] = useState({
    title: "", description: "", assignedTo: "",
    priority: "Medium", status: "Pending",
    deadline: "", progressPercent: 0
  });
  const [submitForm, setSubmitForm] = useState({
    title: "", description: "", priority: "Medium", deadline: ""
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadTasks();
    loadMyTasks();
    if (isAdmin) {
      axios.get("http://localhost:5000/api/auth/users", auth)
        .then(res => setUsers(res.data))
        .catch(() => toast.error("Failed to load users"));
    }
  }, []);

  useEffect(() => { loadTasks(); }, [search, sort, filterPriority, filterStatus]);

  const loadTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (sort) params.append("sort", sort);
      if (filterPriority !== "All") params.append("priority", filterPriority);
      if (filterStatus !== "All") params.append("status", filterStatus);
      const res = await axios.get(`http://localhost:5000/api/tasks/all?${params}`, auth);
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const loadMyTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks/my", auth);
      setMyTasks(res.data);
    } catch {}
  };

  const resetForm = () => {
    setForm({ title: "", description: "", assignedTo: "", priority: "Medium", status: "Pending", deadline: "", progressPercent: 0 });
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
      setActiveTab("all");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const submitUserTask = async (e) => {
    e.preventDefault();
    if (!submitForm.title) { toast.error("Title is required"); return; }
    try {
      await axios.post("http://localhost:5000/api/tasks/submit", submitForm, auth);
      toast.success("Task submitted for approval!");
      setSubmitForm({ title: "", description: "", priority: "Medium", deadline: "" });
      loadMyTasks();
      setActiveTab("my");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
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
    const next = task.status === "Pending" ? "In Progress"
      : task.status === "In Progress" ? "Completed" : "Pending";
    try {
      await axios.put(`http://localhost:5000/api/tasks/update/${task._id}`, { status: next }, auth);
      toast.success(`Status → ${next}`);
      loadTasks();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const updateMyTaskStatus = async (task) => {
    const next = task.status === "Pending" ? "In Progress"
      : task.status === "In Progress" ? "Completed" : "Pending";
    try {
      await axios.put(`http://localhost:5000/api/tasks/update-status/${task._id}`, { status: next }, auth);
      toast.success(`Status → ${next}`);
      loadMyTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const updateProgress = async (task, value) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/update/${task._id}`, { progressPercent: Number(value) }, auth);
      loadTasks();
    } catch {
      toast.error("Failed to update progress");
    }
  };

  const startEdit = (task) => {
    setForm({
      title: task.title, description: task.description,
      assignedTo: task.assignedTo?._id || "",
      priority: task.priority, status: task.status,
      deadline: task.deadline ? task.deadline.slice(0, 10) : "",
      progressPercent: task.progressPercent || 0
    });
    setEditId(task._id);
    setActiveTab("submit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDeadlineBadge = (deadline, status) => {
    if (!deadline || status === "Completed") return null;
    const days = getDaysLeft(deadline);
    if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: "#dc2626", bg: "rgba(239,68,68,0.12)" };
    if (days === 0) return { label: "Due today!", color: "#d97706", bg: "rgba(251,191,36,0.12)" };
    if (days <= 3) return { label: `${days}d left`, color: "#d97706", bg: "rgba(251,191,36,0.12)" };
    return { label: `${days}d left`, color: "#16a34a", bg: "rgba(34,197,94,0.12)" };
  };

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

  const getApprovalBadge = (status) => {
    if (status === "Approved") return { bg: "rgba(34,197,94,0.12)", color: "#16a34a", label: "✅ Approved" };
    if (status === "Rejected") return { bg: "rgba(239,68,68,0.12)", color: "#dc2626", label: "❌ Rejected" };
    return { bg: "rgba(251,191,36,0.12)", color: "#d97706", label: "⏳ Pending Approval" };
  };

  const TaskCard = ({ task, showControls = true, onStatusUpdate }) => {
    const approval = getApprovalBadge(task.approvalStatus);
    const deadlineBadge = getDeadlineBadge(task.deadline, task.status);
    const progress = task.progressPercent || 0;

    return (
      <div className="task-card">
        {/* Title + Badges */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{task.title}</div>
          <div style={{ display: "flex", gap: "6px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
            <span className={getStatusBadge(task.status)}>{task.status}</span>
            {deadlineBadge && (
              <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: deadlineBadge.bg, color: deadlineBadge.color }}>
                📅 {deadlineBadge.label}
              </span>
            )}
            <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: approval.bg, color: approval.color }}>
              {approval.label}
            </span>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>
            {task.description}
          </div>
        )}

        {/* Meta */}
        <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
          {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
          {task.submittedBy && <span>📝 {task.submittedBy.name}</span>}
          {task.deadline && <span>🗓 {new Date(task.deadline).toLocaleDateString()}</span>}
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Progress</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)" }}>{progress}%</span>
          </div>
          <div style={{ background: "var(--bg-tertiary)", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`, height: "100%", borderRadius: "999px",
              background: progress === 100 ? "#22c55e" : progress >= 50 ? "var(--accent)" : "#fbbf24",
              transition: "width 0.5s ease"
            }} />
          </div>
          {isAdmin && showControls && (
            <input type="range" min="0" max="100" step="5" value={progress}
              onChange={e => updateProgress(task, e.target.value)}
              style={{ width: "100%", marginTop: "6px", accentColor: "var(--accent)", cursor: "pointer" }}
            />
          )}
        </div>

        {/* Action Buttons */}
        {showControls && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {isAdmin && (
              <>
                <button className="btn-sm-custom btn-toggle" onClick={() => toggleStatus(task)}>⟳ Status</button>
                <button className="btn-sm-custom btn-edit" onClick={() => startEdit(task)}>✏️ Edit</button>
                <button className="btn-sm-custom btn-delete" onClick={() => deleteTask(task._id)}>🗑 Delete</button>
              </>
            )}
            {onStatusUpdate && (
              <button className="btn-sm-custom btn-toggle" onClick={() => onStatusUpdate(task)}>⟳ Update Status</button>
            )}
          </div>
        )}

        {/* Activity Log */}
        {task.activityLog?.length > 0 && (
          <div style={{ marginTop: "12px" }}>
            <button onClick={() => setExpandedLog(expandedLog === task._id ? null : task._id)}
              style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "12px", cursor: "pointer", padding: 0, fontWeight: 500 }}>
              {expandedLog === task._id ? "▲ Hide" : "▼ Show"} Activity Log ({task.activityLog.length})
            </button>
            {expandedLog === task._id && (
              <div style={{ marginTop: "8px", borderLeft: "2px solid var(--accent)", paddingLeft: "12px" }}>
                {[...task.activityLog].reverse().map((log, i) => (
                  <div key={i} style={{ marginBottom: "6px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{log.action}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      by {log.by} · {new Date(log.at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="page-title">Task Manager</div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "📋 All Tasks" },
            { key: "my", label: "👤 My Tasks" },
            { key: "submit", label: isAdmin ? "➕ New Task" : "📝 Submit Task" }
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "8px 18px", borderRadius: "10px", border: "1px solid",
              fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
              background: activeTab === tab.key ? "var(--accent-bg)" : "transparent",
              borderColor: activeTab === tab.key ? "var(--accent)" : "var(--border)",
              color: activeTab === tab.key ? "var(--accent)" : "var(--text-secondary)"
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ALL TASKS TAB */}
        {activeTab === "all" && (
          <>
            {/* Search + Sort + Filter Bar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "10px", marginBottom: "20px" }}>
              <input
                className="input-custom"
                placeholder="🔍 Search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: 0 }}
              />
              <select className="select-custom" value={sort} onChange={e => setSort(e.target.value)} style={{ marginBottom: 0, width: "auto" }}>
                <option value="newest">⬇ Newest</option>
                <option value="oldest">⬆ Oldest</option>
                <option value="deadline">📅 Deadline</option>
                <option value="priority">🔥 Priority</option>
                <option value="progress">📊 Progress</option>
              </select>
              <select className="select-custom" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ marginBottom: 0, width: "auto" }}>
                <option value="All">All Priority</option>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
              <select className="select-custom" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ marginBottom: 0, width: "auto" }}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} found
              {search && ` for "${search}"`}
            </div>

            {loading ? (
              <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "40px", textAlign: "center",
                color: "var(--text-secondary)", fontSize: "14px"
              }}>No tasks found.</div>
            ) : (
              tasks.map(task => <TaskCard key={task._id} task={task} />)
            )}
          </>
        )}

        {/* MY TASKS TAB */}
        {activeTab === "my" && (
          <>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Tasks assigned to you — update status and track your progress.
            </div>
            {myTasks.length === 0 ? (
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "40px", textAlign: "center",
                color: "var(--text-secondary)", fontSize: "14px"
              }}>No tasks assigned to you yet.</div>
            ) : (
              myTasks.map(task => (
                <TaskCard key={task._id} task={task} showControls={true} onStatusUpdate={updateMyTaskStatus} />
              ))
            )}
          </>
        )}

        {/* SUBMIT / NEW TASK TAB */}
        {activeTab === "submit" && (
          <div className="form-card">
            {isAdmin ? (
              <>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "18px" }}>
                  {editId ? "✏️ Edit Task" : "➕ New Task"}
                </div>
                <form onSubmit={submit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <input className="input-custom" placeholder="Task Title" value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })} />
                    <input className="input-custom" placeholder="Description" value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })} />
                    <select className="select-custom" value={form.assignedTo}
                      onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                      <option value="">Assign to User</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
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
                    <input type="date" className="input-custom" value={form.deadline}
                      onChange={e => setForm({ ...form, deadline: e.target.value })} />
                  </div>

                  {/* Progress Slider */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Progress</label>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent)" }}>{form.progressPercent}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="5" value={form.progressPercent}
                      onChange={e => setForm({ ...form, progressPercent: Number(e.target.value) })}
                      style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" className="btn-primary-custom" style={{ width: "auto", padding: "10px 28px" }}>
                      {editId ? "Update Task" : "Add Task"}
                    </button>
                    {editId && (
                      <button type="button" onClick={resetForm} style={{
                        background: "var(--bg-tertiary)", border: "1px solid var(--border)",
                        color: "var(--text-secondary)", padding: "10px 20px",
                        borderRadius: "10px", cursor: "pointer", fontSize: "14px"
                      }}>Cancel</button>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                  📝 Submit a Task
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                  Submit a task request — admin will review and approve it.
                </div>
                <form onSubmit={submitUserTask}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <input className="input-custom" placeholder="Task Title" value={submitForm.title}
                      onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })} />
                    <input className="input-custom" placeholder="Description" value={submitForm.description}
                      onChange={e => setSubmitForm({ ...submitForm, description: e.target.value })} />
                    <select className="select-custom" value={submitForm.priority}
                      onChange={e => setSubmitForm({ ...submitForm, priority: e.target.value })}>
                      <option value="Low">🟢 Low Priority</option>
                      <option value="Medium">🟡 Medium Priority</option>
                      <option value="High">🔴 High Priority</option>
                    </select>
                    <input type="date" className="input-custom" value={submitForm.deadline}
                      onChange={e => setSubmitForm({ ...submitForm, deadline: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary-custom" style={{ width: "auto", padding: "10px 28px", marginTop: "4px" }}>
                    Submit for Approval
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}