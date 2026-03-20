export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    window.location = "/login";
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2>Welcome, {user?.name} 🎉</h2>
        <p>Email: {user?.email}</p>

        <button className="btn btn-danger mt-3" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}