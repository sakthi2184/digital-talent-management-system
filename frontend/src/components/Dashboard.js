import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";


function Dashboard() {
  const navigate = useNavigate();

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/"); // go back to login
  };

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>DTMS</h2>
        <ul>
          <li>Dashboard</li>
          <li>Users</li>
          <li>Projects</li>
          <li>Settings</li>
        </ul>
      </div>

      {/* Main */}
      <div className="main">

        {/* Topbar */}
        <div className="topbar">
          <h2>Dashboard</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* Cards */}
        <div className="cards">
          <div className="card">
            <h3>Total Users</h3>
            <p>120</p>
          </div>

          <div className="card">
            <h3>Projects</h3>
            <p>15</p>
          </div>

          <div className="card">
            <h3>Tasks</h3>
            <p>45</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;