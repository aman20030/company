import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaUsers,
  FaCogs,
  FaGift,
  FaTags,
  FaBullhorn,
  FaSignOutAlt,
  FaUserCircle
} from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const menuItems = [
    { icon: <FaHome />, label: "Dashboard", path: "/" },
    { icon: <FaUsers />, label: "Client Onboard", path: "/client" },
    { icon: <FaCogs />, label: "Admin Console", path: "/admin" },
    { icon: <FaTags />, label: "Offers", path: "/offers" },
    { icon: <FaGift />, label: "Rewards", path: "/rewards" },
    { icon: <FaUsers />, label: "Requests", path: "/requests" },
    { icon: <FaBullhorn />, label: "Ads", path: "/ads" },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
        {/* Logo Section */}
        <div className="top-section">
          <div className={`logo ${!isOpen ? "collapsed-logo" : ""}`}>
            <span className="logo-en">Khud</span>
            <span className="logo-hi">पे</span>
          </div>

          {/* Toggle button INSIDE sidebar */}
          <div
            className={`toggle-btn ${isOpen ? "" : "collapsed-btn"}`}
            onClick={toggleSidebar}
          >
            {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </div>
        </div>

        {/* Menu */}
        <ul className="menu">
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `menu-link ${isActive ? "active" : ""} ${isOpen ? "" : "closed"}`
                }
                onClick={() => isMobile && setIsOpen(false)}
              >
                <div className="icon">{item.icon}</div>
                {isOpen ? (
                  <span className="label">{item.label}</span>
                ) : (
                  <span className="collapsed-label">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Bottom Section */}
        <div className="bottom-section">
          <NavLink
            to="/user-details"
            className="user-info"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <FaUserCircle className="user-icon" />
            {isOpen ? (
              <span className="user-name">username</span>
            ) : (
              <span className="collapsed-label">User</span>
            )}
          </NavLink>

          <NavLink
            to="/logout"
            className="logout"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <FaSignOutAlt />
            {isOpen ? <span>Logout</span> : <span className="collapsed-label">Exit</span>}
          </NavLink>
        </div>
      </div>
    </>
  );
}
