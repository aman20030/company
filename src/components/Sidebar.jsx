import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, toggleSidebar }) {
  return ( 
    <>
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isOpen ? "⬅ Hide" : "➡ Show"}
        </button>

        <div className="sidebar-header">
          <h2 className="sidebar-logo">Khud पे</h2>
        </div>

        <ul className="sidebar-menu">
          <li><NavLink to="/" className="sidebar-link">📊 Dashboard</NavLink></li>
          <li><NavLink to="/client" className="sidebar-link">🧾 Client Onboard</NavLink></li>
          <li><NavLink to="/admin" className="sidebar-link">🛠 Admin Console</NavLink></li>
          <li><NavLink to="/offers" className="sidebar-link">💰 Offers</NavLink></li>
          <li><NavLink to="/rewards" className="sidebar-link">🎁 Rewards</NavLink></li>
          <li><NavLink to="/requests" className="sidebar-link">📩 Requests</NavLink></li>
          <li><NavLink to="/ads" className="sidebar-link">📢 ADs</NavLink></li>
        </ul>

        <div className={`sidebar-footer ${isOpen ? "show" : "hide"}`}>
          <p>Username</p>
          <a href="/logout" className="logout-link">Logout</a>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
