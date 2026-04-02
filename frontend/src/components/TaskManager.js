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
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("all");
  const [form, setForm] = useState({
    title: "", description: "", assignedTo: "",
    priority: "Medium", status: "Pending", deadline: ""
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

  const loadMyTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks/my", auth);
      setMyTasks(res.data);
    } catch {
      toast.error("Failed to load my tasks");
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

  const submitUserTask = async (e) => {
    e.preventDefault();
    if (!submitForm.title) { toast.error("Title is required"); return; }
    try {
      await axios.post("http://localhost:5000/api/tasks/submit", submitForm, auth);
      toast.success("Task submitted for approval!");
      setSubmitForm({ title: "", description: "", priority: "Medium", deadline: "" });
      loadMyTasks();
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

  const updateMyTaskStatus = async (task) => {
    const next = task.status === "Pending"
      ? "In Progress" : task.status === "In Progress"
      ? "Completed" : "Pending";
    try {
      await axios.put(`http://localhost:5000/api/tasks/update-status/${task._id}`, { status: next }, auth);
      toast.success(`Status → ${next}`);
      loadMyTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const startEdit = (task) => {
    setForm({
      title: task.title, description: task.description,
      assignedTo: task.assignedTo?._id || "",
      priority: task.priority, status: task.status,
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

  const getApprovalBadge = (status) => {
    if (status === "Approved") return { bg: "rgba(34,197,94,0.12)", color: "#16a34a", label: "✅ Approved" };
    if (status === "Rejected") return { bg: "rgba(239,68,68,0.12)", color: "#dc2626", label: "❌ Rejected" };
    return { bg: "rgba(251,191,36,0.12)", color: "#d97706", label: "⏳ Pending Approval" };
  };

  const filteredTasks = filter === "All" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="page-title">Task Manager</div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {[
            { key: "all", label: "📋 All Tasks" },
            { key: "my", label: "👤 My Tasks" },
            ...(isAdmin ? [{ key: "submit", label: "➕ New Task" }] : [{ key: "submit", label: "📝 Submit Task" }])
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
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {["All", "Pending", "In Progress", "Completed"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "7px 16px", borderRadius: "20px", border: "1px solid",
                  fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                  background: filter === f ? "var(--accent-bg)" : "transparent",
                  borderColor: filter === f ? "var(--accent)" : "var(--border)",
                  color: filter === f ? "var(--accent)" : "var(--text-secondary)"
                }}>{f}</button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: "13px", color: "var(--text-secondary)", alignSelf: "center" }}>
                {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "40px", textAlign: "center",
                color: "var(--text-secondary)", fontSize: "14px"
              }}>No tasks found.</div>
            ) : (
              filteredTasks.map(task => {
                const approval = getApprovalBadge(task.approvalStatus);
                return (
                  <div key={task._id} className="task-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{task.title}</div>
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0, flexWrap: "wrap" }}>
                        <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
                        <span className={getStatusBadge(task.status)}>{task.status}</span>
                        <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: approval.bg, color: approval.color }}>
                          {approval.label}
                        </span>
                      </div>
                    </div>
                    {task.description && (
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                        {task.description}
                      </div>
                    )}
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                      {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                      {task.submittedBy && <span>📝 Submitted by {task.submittedBy.name}</span>}
                      {task.deadline && <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>}
                    </div>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn-sm-custom btn-toggle" onClick={() => toggleStatus(task)}>⟳ Status</button>
                        <button className="btn-sm-custom btn-edit" onClick={() => { startEdit(task); setActiveTab("submit"); }}>✏️ Edit</button>
                        <button className="btn-sm-custom btn-delete" onClick={() => deleteTask(task._id)}>🗑 Delete</button>
                      </div>
                    )}
                    {!isAdmin && (
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        👁 View only — use My Tasks to update your assigned tasks
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* MY TASKS TAB */}
        {activeTab === "my" && (
          <>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Tasks assigned to you — you can update the status of your own tasks.
            </div>
            {myTasks.length === 0 ? (
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "40px", textAlign: "center",
                color: "var(--text-secondary)", fontSize: "14px"
              }}>No tasks assigned to you yet.</div>
            ) : (
              myTasks.map(task => {
                const approval = getApprovalBadge(task.approvalStatus);
                return (
                  <div key={task._id} className="task-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{task.title}</div>
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0, flexWrap: "wrap" }}>
                        <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
                        <span className={getStatusBadge(task.status)}>{task.status}</span>
                        <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: approval.bg, color: approval.color }}>
                          {approval.label}
                        </span>
                      </div>
                    </div>
                    {task.description && (
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                        {task.description}
                      </div>
                    )}
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px", display: "flex", gap: "14px" }}>
                      {task.deadline && <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>}
                    </div>
                    <button className="btn-sm-custom btn-toggle" onClick={() => updateMyTaskStatus(task)}>
                      ⟳ Update Status
                    </button>
                  </div>
                );
              })
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
                  <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
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