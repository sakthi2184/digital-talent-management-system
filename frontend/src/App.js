import React from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div>
      <h1>DTMS</h1>
      <Register />
      <hr />
      <Login />
      <hr />
      <Dashboard />
    </div>
  );
}

export default App;