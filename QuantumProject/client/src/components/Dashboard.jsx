import React from "react";
import { useNavigate } from "react-router-dom";

function staticTableData() {
  return [
    { id: 1, title: "Project Alpha", owner: "Alice", status: "Active", due: "2025-12-01" },
    { id: 2, title: "Bookify", owner: "Bob", status: "Planning", due: "2026-01-15" },
    { id: 3, title: "Smart Dashboard", owner: "Charlie", status: "Completed", due: "2025-07-20" },
  ];
}

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const rows = staticTableData();

  const stats = [
    { title: "Active Projects", value: 1, color: "#34d399" },
    { title: "Planning", value: 1, color: "#fbbf24" },
    { title: "Completed", value: 1, color: "#60a5fa" },
  ];

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header-glass">
        <div>
          <h1 className="dashboard-title-glow">Welcome, {user?.name || "User"} 👋</h1>
          <p className="dashboard-sub">Logged in as <strong>{user?.email}</strong></p>
        </div>
        <button className="logout-btn-glow" onClick={handleLogout}>Logout</button>
      </header>

      <section className="stats-section">
        {stats.map((s, i) => (
          <div className="stat-card" key={i} style={{ borderColor: s.color }}>
            <h3 style={{ color: s.color }}>{s.title}</h3>
            <p>{s.value}</p>
          </div>
        ))}
      </section>

      <section className="data-section">
        <h2 className="section-title">📊 Project Overview</h2>
        <div className="table-container-glass">
          <table className="data-table-glass">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.title}</td>
                  <td>{r.owner}</td>
                  <td>
                    <span className={`status ${r.status.toLowerCase()}`}>{r.status}</span>
                  </td>
                  <td>{r.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
