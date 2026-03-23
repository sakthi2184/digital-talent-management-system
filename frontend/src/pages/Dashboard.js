import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/tasks/all")
      .then(res => setTasks(res.data));
  }, []);

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const pending = tasks.filter(t => t.status === "Pending").length;

  const logout = () => {
    localStorage.clear();
    window.location = "/login";
  };

  return (
    <div className="container mt-5">
      <h2>Welcome {user?.name} 🎉</h2>

      <div className="row mt-4">
        <div className="col">
          <div className="card p-3">Total: {total}</div>
        </div>
        <div className="col">
          <div className="card p-3">Completed: {completed}</div>
        </div>
        <div className="col">
          <div className="card p-3">Pending: {pending}</div>
        </div>
      </div>

      <a href="/tasks" className="btn btn-primary mt-4">
        Manage Tasks
      </a>

      <button
        className="btn btn-danger mt-4 ms-3"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}