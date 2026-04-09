// File: App.jsx
// Purpose: Client router between public chat and admin dashboard.
// Overview:
// - Detects /admin path
// - Handles admin auth state
import { useEffect, useState } from "react";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import AdminLogin from "./components/admin/AdminLogin.jsx";
import ChatApp from "./components/public/ChatApp.jsx";

const isAdminPath = () => {
  const path = window.location.pathname;
  return path === "/admin" || path === "/admin/";
};

const App = () => {
  const [adminMode, setAdminMode] = useState(isAdminPath());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken") || "");
  const [adminRole, setAdminRole] = useState(localStorage.getItem("adminRole") || "viewer");

  useEffect(() => {
    const handlePop = () => setAdminMode(isAdminPath());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  if (adminMode) {
    return isAuthenticated ? (
      <AdminDashboard
        role={adminRole}
        token={adminToken}
        onLogout={() => {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminRole");
          setIsAuthenticated(false);
        }}
      />
    ) : (
      <AdminLogin
        onSuccess={({ token }) => {
          if (token) setAdminToken(token);
          setAdminRole(localStorage.getItem("adminRole") || "viewer");
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return <ChatApp />;
};

export default App;





