import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import SidebarAndNavbar from "./components/SidebarAndNavbar";
import Dashboard from "./pages/Dashboard";
import UserDetails from "./components/UserDetails";
import ClientOnboarding from "./pages/ClientOnboarding"; 
import Signup from "./components/Signup";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import BranchForm from "./pages/BranchForm";
import MainLayout from "./layouts/MainLayout";

function Layout() {
  const location = useLocation();
  const hideSidebar =
    location.pathname === "/signup" ||
    location.pathname === "/login" ||
    location.pathname === "/forgot-password";

  return (
    <div style={{ display: "flex" }}>
      {!hideSidebar && <Sidebar />}
      <div style={{ padding: "20px", flex: 1 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/user-details" element={<UserDetails />} />
          <Route path="/client" element={<ClientOnboarding />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/branch-form" element={<BranchForm />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
