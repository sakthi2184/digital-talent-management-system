import { useState, useEffect } from "react";
import axios from "axios";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [editId, setEditId] = useState(null);

  const loadTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/tasks/all");
    setTasks(res.data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (editId) {
      await axios.put(
        `http://localhost:5000/api/tasks/update/${editId}`,
        form
      );
      setEditId(null);
    } else {
      await axios.post(
        "http://localhost:5000/api/tasks/add",
        form
      );
    }

    setForm({ title: "", description: "" });
    loadTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/tasks/delete/${id}`
    );
    loadTasks();
  };

  const toggleStatus = async (task) => {
    await axios.put(
      `http://localhost:5000/api/tasks/update/${task._id}`,
      {
        status:
          task.status === "Pending" ? "Completed" : "Pending"
      }
    );
    loadTasks();
  };

  return (
    <div className="container mt-4">
      <h3>Task Manager</h3>

      <form onSubmit={submit}>
        <input
          className="form-control mb-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <input
          className="form-control mb-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value
            })
          }
        />

        <button className="btn btn-primary">
          {editId ? "Update Task" : "Add Task"}
        </button>
      </form>

      <hr />

      {tasks.map((task) => (
        <div key={task._id} className="card p-3 mb-2">
          <h5>{task.title}</h5>
          <p>{task.description}</p>
          <p>
            Status: <strong>{task.status}</strong>
          </p>

          <button
            className="btn btn-success btn-sm me-2"
            onClick={() => toggleStatus(task)}
          >
            Toggle Status
          </button>

          <button
            className="btn btn-warning btn-sm me-2"
            onClick={() => {
              setForm({
                title: task.title,
                description: task.description
              });
              setEditId(task._id);
            }}
          >
            Edit
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => deleteTask(task._id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}