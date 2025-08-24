import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export default function SidebarAndNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar">
        <div className="top-section">
          <div className="logo">My Logo</div>
          <div className="toggle-icon">⇔</div>
        </div>
        <ul className="menu">
          <li><NavLink to="/" className="menu-link">📊 Dashboard</NavLink></li>
           
          <li><NavLink to="/offers" className="menu-link">💰 Offers</NavLink></li>
        </ul>
        <div className="bottom-section">
          <div className="logout">🚪 Logout</div>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="mobile-navbar">
        <div className="logo">My Logo</div>
        <div
          className="menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? "✖" : "☰"}
        </div>
      </div>
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <NavLink to="/" onClick={() => setMobileOpen(false)}>📊 Dashboard</NavLink>
        <NavLink to="/client" onClick={() => setMobileOpen(false)}>🧾 Client Onboard</NavLink>
        <NavLink to="/admin" onClick={() => setMobileOpen(false)}>🛠 Admin Console</NavLink>
        <NavLink to="/offers" onClick={() => setMobileOpen(false)}>💰 Offers</NavLink>
      </div>
    </>
  );
}
