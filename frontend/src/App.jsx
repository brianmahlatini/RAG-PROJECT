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

  useEffect(() => {
    const handlePop = () => setAdminMode(isAdminPath());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  if (adminMode) {
    return isAuthenticated ? (
      <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
    ) : (
      <AdminLogin onSuccess={() => setIsAuthenticated(true)} />
    );
  }

  return <ChatApp />;
};

export default App;
