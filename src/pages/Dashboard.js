import React from "react";
import "./Dashboard.css";

export default function Dashboard() {
  const stats = [
    { title: "Total Clients", value: 128, color: "#4CAF50" },
    { title: "Active Offers", value: 24, color: "#2196F3" },
    { title: "Pending Requests", value: 8, color: "#FF9800" },
    { title: "Revenue", value: "$12,450", color: "#9C27B0" },
  ];

  const activities = [
    "John Doe onboarded as a client",
    "New offer launched: 'Summer Bonanza'",
    "5 requests approved today",
    "Admin panel settings updated",
  ];

  return (
    <div className="dashboard-container">
      
      <h1>Welcome Back, Raj Sharma 👋</h1>
      <p>Here’s what’s happening with your business today.</p>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTop: `4px solid ${stat.color}` }}>
            <h2>{stat.value}</h2>
            <p>{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        <ul>
          {activities.map((activity, index) => (
            <li key={index}>• {activity}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
